import { FastifyPluginAsync } from "fastify";
import { createSuccessResponse } from "../utils/response";

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return createSuccessResponse({ status: "ok", timestamp: new Date().toISOString() });
    });
};
