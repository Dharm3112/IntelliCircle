import Fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { createErrorResponse, createSuccessResponse } from "./utils/response";
import { healthRoutes } from "./routes/health";
import { dbTestRoutes } from "./routes/test-db";
import { authRoutes } from "./routes/auth";
import { roomRoutes } from "./routes/rooms";
import { websocketRoutes } from "./websocket/wsHandler";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import fastifyWebsocket from "@fastify/websocket";

declare module "fastify" {
    export interface FastifyInstance {
        authenticate: any;
        requireRole: (roles: string[]) => any;
    }
}

export const buildApp = async () => {
    const app = Fastify({
        logger: {
            level: env.NODE_ENV === "production" ? "info" : "debug",
            transport:
                env.NODE_ENV !== "production"
                    ? {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "HH:MM:ss Z",
                            ignore: "pid,hostname",
                        },
                    }
                    : undefined,
        },
    });

    // --- Security Plugins ---
    await app.register(helmet);
    await app.register(cors, {
        origin: env.NODE_ENV === "production" ? ["https://intellicircle.com"] : true,
        credentials: true,
    });

    // Register WebSockets early in the pipeline to bind the upgrade handlers correctly
    await app.register(fastifyWebsocket, {
        options: { maxPayload: 1048576 } // Restrict WS payload sizes to 1MB
    });

    // Basic Rate Limiting
    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    // --- Auth Plugins ---
    await app.register(fastifyJwt, {
        secret: {
            private: env.JWT_PRIVATE_KEY,
            public: env.JWT_PUBLIC_KEY,
        },
        sign: {
            algorithm: 'RS256'
        },
        cookie: {
            cookieName: 'refreshToken',
            signed: false,
        }
    });

    await app.register(fastifyCookie);
    await app.register(fastifyCsrfProtection, {
        cookieOpts: { signed: false },
        sessionPlugin: '@fastify/cookie'
    });

    // --- CSRF Endpoint ---
    app.get("/api/csrf", async (request, reply) => {
        const token = await reply.generateCsrf();
        return reply.status(200).send(createSuccessResponse({ csrfToken: token }));
    });

    // --- Authentication Decorator ---
    app.decorate("authenticate", async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send(createErrorResponse("Unauthorized", "UNAUTHORIZED"));
        }
    });

    // --- RBAC Decorator ---
    app.decorate("requireRole", (allowedRoles: string[]) => {
        return async (request: any, reply: any) => {
            try {
                await request.jwtVerify();
                const user = request.user as { role: string };
                if (!allowedRoles.includes(user.role)) {
                    return reply.status(403).send(createErrorResponse("Forbidden: Insufficient privileges", "FORBIDDEN"));
                }
            } catch (err) {
                reply.status(401).send(createErrorResponse("Unauthorized", "UNAUTHORIZED"));
            }
        };
    });

    // --- Routes ---
    app.register(healthRoutes, { prefix: "/api" });
    app.register(dbTestRoutes, { prefix: "/api" });
    app.register(authRoutes, { prefix: "/api/auth" });
    app.register(roomRoutes, { prefix: "/api/rooms" });
    app.register(websocketRoutes, { prefix: "/ws" });

    // --- Global Error Handler ---
    app.setErrorHandler((error: FastifyError, request, reply) => {
        app.log.error(error);
        const statusCode = error.statusCode || 500;
        const message = env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : error.message;
        reply.status(statusCode).send(createErrorResponse(message, error.code));
    });

    // --- Global Not Found Handler ---
    app.setNotFoundHandler((request, reply) => {
        reply.status(404).send(createErrorResponse("Route not found", "NOT_FOUND"));
    });

    return app;
};
