import Fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { metrics } from "./utils/metrics";
import { buildLoggerTransport } from "./utils/pino-datadog-transport";
import { createErrorResponse, createSuccessResponse } from "./utils/response";
import { healthRoutes } from "./routes/health";
import { dbTestRoutes } from "./routes/test-db";
import { authRoutes } from "./routes/auth";
import { roomRoutes } from "./routes/rooms";
import { waitlistRoutes } from "./routes/waitlist";
import { websocketRoutes } from "./websocket/wsHandler";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import { getRedisClient } from "./db/redis";

declare module "fastify" {
    export interface FastifyInstance {
        authenticate: any;
        requireRole: (roles: string[]) => any;
    }
}

export const buildApp = async () => {
    const app = Fastify({
        bodyLimit: 1048576, // 1MB payload limit globally to prevent buffer overflow attacks
        logger: {
            level: env.NODE_ENV === "production" ? "info" : "debug",
            redact: {
                paths: [
                    // Auth & Session tokens
                    'req.headers.authorization',
                    'req.headers.cookie',
                    'req.query.token', // WS handshake JWT passed as query param
                    'token',
                    'refreshToken',
                    'accessToken',
                    // User PII fields
                    'email',
                    'req.body.email',
                    'password',
                    'passwordHash',
                    'fullName',
                    'req.body.fullName',
                    'ipAddress',
                    // User-generated content
                    'content' // Redact exact message content from structured logs
                ],
                censor: '[REDACTED]'
            },
            transport: buildLoggerTransport(env.NODE_ENV),
        },
    });

    // --- Security Plugins ---
    await app.register(helmet);

    // Build CORS origins from env – supports comma-separated list
    const corsOrigins = env.NODE_ENV === "production"
        ? (env.CORS_ORIGIN
            ? env.CORS_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, ''))
            : ["https://intelli-circle-client.vercel.app"])
        : true;

    await app.register(cors, {
        origin: corsOrigins,
        credentials: true,
    });

    // Register WebSockets early in the pipeline to bind the upgrade handlers correctly
    await app.register(fastifyWebsocket, {
        options: { maxPayload: 1048576 } // Restrict WS payload sizes to 1MB
    });

    // Register Multipart for potential file uploads safely
    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 5242880, // 5MB limit
            files: 1
        }
    });

    // Advanced Rate Limiting over Redis
    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
        redis: getRedisClient(),
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
    app.register(waitlistRoutes, { prefix: "/api/waitlist" });
    app.register(websocketRoutes, { prefix: "/ws" });

    // --- Observability: Per-Route HTTP Latency Tracking ---
    app.addHook('onResponse', (request, reply, done) => {
        // Fastify provides response time natively via reply.elapsedTime
        const responseTime = reply.elapsedTime;
        const routeUrl = request.routeOptions?.url || request.url;
        const method = request.method;
        const statusCode = reply.statusCode;

        metrics.histogram('http_request_duration_ms', responseTime, [
            `route:${method}:${routeUrl}`,
            `status:${statusCode}`,
        ]);

        // Track 5xx errors as a separate counter for alerting
        if (statusCode >= 500) {
            metrics.increment('http_5xx_errors', 1, [
                `route:${method}:${routeUrl}`,
            ]);
        }

        done();
    });

    // --- Global Error Handler ---
    app.setErrorHandler((error: FastifyError, request, reply) => {
        const statusCode = error.statusCode || 500;

        if (statusCode === 400) {
            app.log.error(`[400 Bad Request] URL: ${request.url}`);
            app.log.error(`[400 Bad Request] Query: ${JSON.stringify(request.query)}`);
            app.log.error(`[400 Bad Request] Body: ${JSON.stringify(request.body)}`);
            app.log.error(error, `[400 Bad Request] Error:`);
        } else {
            app.log.error(error);
        }

        const message = env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : error.message;
        reply.status(statusCode).send(createErrorResponse(message, error.code));
    });

    // --- Global Not Found Handler ---
    app.setNotFoundHandler((request, reply) => {
        reply.status(404).send(createErrorResponse("Route not found", "NOT_FOUND"));
    });

    return app;
};
