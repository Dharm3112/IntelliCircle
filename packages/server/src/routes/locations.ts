import { FastifyInstance } from "fastify";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function locationRoutes(app: FastifyInstance) {
    app.get("/", async (request, reply) => {
        return reply.send(createSuccessResponse([]));
    });
}
