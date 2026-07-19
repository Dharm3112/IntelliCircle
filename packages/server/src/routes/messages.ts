import { FastifyInstance } from "fastify";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function messageRoutes(app: FastifyInstance) {
    app.get("/", async (request, reply) => {
        return reply.send(createSuccessResponse([]));
    });
}
