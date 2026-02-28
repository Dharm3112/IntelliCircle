import Fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { createErrorResponse } from "./utils/response";
import { healthRoutes } from "./routes/health";

export const buildApp = async () => {
    const app = Fastify({
        logger,
    });

    // --- Security Plugins ---
    await app.register(helmet);
    await app.register(cors, {
        origin: env.NODE_ENV === "production" ? ["https://intellicircle.com"] : true,
    });

    // Basic Rate Limiting
    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    // --- Routes ---
    app.register(healthRoutes, { prefix: "/api" });

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
