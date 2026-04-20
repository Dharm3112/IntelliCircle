import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { users } from "@intellicircle/shared";
import {
    anonymousAuthSchema,
    upgradeAuthSchema,
    loginAuthSchema,
    authAuditLogs
} from "@intellicircle/shared";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, blacklistToken, isTokenBlacklisted } from "../utils/auth";
import crypto from "crypto";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function authRoutes(app: FastifyInstance) {
    // 1. Frictionless Anonymous Login
    app.post("/anonymous", { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
        const payload = anonymousAuthSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { username } = payload.data;

        // Check if username already exists
        const existingUsers = await db.select().from(users).where(eq(users.username, username)).limit(1);

        let user;
        if (existingUsers.length > 0) {
            user = existingUsers[0];
            // If the user has an email, they are no longer anonymous. They must use standard login.
            if (user.email) {
                // Audit Log
                await db.insert(authAuditLogs).values({
                    ipAddress: request.ip,
                    eventType: "signup_failed",
                    usernameOrEmailAttempted: username,
                    userAgent: request.headers['user-agent'] || null
                });
                return reply.status(403).send(createErrorResponse("Username is already claimed by a registered account. Please login.", "ACCOUNT_CLAIMED"));
            }
        } else {
            // Create new anonymous user
            const [newUser] = await db.insert(users).values({
                username,
            }).returning();
            user = newUser;
        }

        // Issue Tokens
        const accessToken = app.jwt.sign({ id: user.id, username: user.username, role: user.role }, { expiresIn: "15m" });
        const refreshToken = app.jwt.sign({ id: user.id, type: 'refresh', jti: crypto.randomUUID() }, { expiresIn: "7d" });

        reply.setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return reply.status(200).send(createSuccessResponse({ accessToken, user: { id: user.id, username: user.username, role: user.role } }));
    });

    // 2. Upgrade Account
    app.post("/upgrade", { preValidation: [app.authenticate], config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
        const payload = upgradeAuthSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { email, password } = payload.data;
        const userId = (request.user as any).id;

        // Check if email is already in use
        const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingEmail.length > 0) {
            return reply.status(409).send(createErrorResponse("Email already in use", "CONFLICT"));
        }

        const hashedPassword = await hashPassword(password);

        // Update User Profile
        await db.update(users).set({ email, passwordHash: hashedPassword }).where(eq(users.id, userId));

        return reply.status(200).send(createSuccessResponse({ message: "Account upgraded successfully" }));
    });

    // 3. Standard Login
    app.post("/login", { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
        const payload = loginAuthSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { usernameOrEmail, password } = payload.data;

        // Fetch User (check both email and username)
        const userMatches = await db.select().from(users)
            .where(eq(users.email, usernameOrEmail))
            .limit(1);

        let user = userMatches[0];

        if (!user) {
            const userMatchesByName = await db.select().from(users)
                .where(eq(users.username, usernameOrEmail))
                .limit(1);
            user = userMatchesByName[0];
        }

        if (!user || !user.passwordHash) {
            // Audit Log
            await db.insert(authAuditLogs).values({
                ipAddress: request.ip,
                eventType: "login_failed",
                usernameOrEmailAttempted: usernameOrEmail,
                userAgent: request.headers['user-agent'] || null
            });
            return reply.status(401).send(createErrorResponse("Invalid credentials", "UNAUTHORIZED"));
        }

        // Verify Password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            // Audit Log
            await db.insert(authAuditLogs).values({
                ipAddress: request.ip,
                eventType: "login_failed",
                usernameOrEmailAttempted: usernameOrEmail,
                userAgent: request.headers['user-agent'] || null
            });
            return reply.status(401).send(createErrorResponse("Invalid credentials", "UNAUTHORIZED"));
        }

        // Issue Tokens
        const accessToken = app.jwt.sign({ id: user.id, username: user.username, role: user.role }, { expiresIn: "15m" });
        const refreshToken = app.jwt.sign({ id: user.id, type: 'refresh', jti: crypto.randomUUID() }, { expiresIn: "7d" });

        reply.setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60
        });

        return reply.status(200).send(createSuccessResponse({ accessToken, user: { id: user.id, username: user.username, role: user.role } }));
    });

    // 4. Token Refresh
    app.post("/refresh", async (request, reply) => {
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) {
            return reply.status(401).send(createErrorResponse("Refresh token missing", "UNAUTHORIZED"));
        }

        try {
            // Verify the refresh token's RS256 signature
            const decoded = app.jwt.verify<{ id: number; type: string; jti: string }>(refreshToken);

            if (decoded.type !== 'refresh') {
                return reply.status(401).send(createErrorResponse("Invalid token type", "UNAUTHORIZED"));
            }

            // Check if this refresh token was blacklisted (e.g., from a previous logout or rotation)
            const isBlacklisted = await isTokenBlacklisted(decoded.jti);
            if (isBlacklisted) {
                return reply.status(401).send(createErrorResponse("Session revoked", "UNAUTHORIZED"));
            }

            // Fetch absolute latest user state from DB
            const existingUsers = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
            const user = existingUsers[0];

            if (!user) {
                return reply.status(401).send(createErrorResponse("User no longer exists", "UNAUTHORIZED"));
            }

            // Rotate: Blacklist the OLD refresh token immediately
            // Expire the blacklist key in 7 days (the max lifetime of the refresh token)
            await blacklistToken(decoded.jti, 7 * 24 * 60 * 60 * 1000);

            // Issue New Tokens
            // Note: Utilizing `crypto.randomUUID()` for unique `jti` to ensure unique keys in Redis
            const crypto = require('crypto');
            const newJti = crypto.randomUUID();

            const accessToken = app.jwt.sign({ id: user.id, username: user.username, role: user.role }, { expiresIn: "15m" });
            const newRefreshToken = app.jwt.sign({ id: user.id, type: 'refresh', jti: newJti }, { expiresIn: "7d" });

            reply.setCookie('refreshToken', newRefreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60
            });

            return reply.status(200).send(createSuccessResponse({ accessToken, user: { id: user.id, username: user.username, role: user.role } }));
        } catch (err) {
            return reply.status(401).send(createErrorResponse("Invalid or expired refresh token", "UNAUTHORIZED"));
        }
    });

    // 5. Remote Logout
    app.post("/logout", async (request, reply) => {
        const refreshToken = request.cookies.refreshToken;

        if (refreshToken) {
            try {
                // Decode to get the JTI without verifying expiration (they might be logging out an expired token)
                const decoded = app.jwt.decode<{ jti?: string }>(refreshToken);
                if (decoded?.jti) {
                    await blacklistToken(decoded.jti, 7 * 24 * 60 * 60 * 1000);
                }
            } catch (e) {
                // Ignore decode errors on logout
            }
            reply.clearCookie('refreshToken', { path: '/' });
        }

        return reply.status(200).send(createSuccessResponse({ message: "Logged out" }));
    });
}
