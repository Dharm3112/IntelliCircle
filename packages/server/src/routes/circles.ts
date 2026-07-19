import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { circles } from "@intellicircle/shared";
import { eq } from "drizzle-orm";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function circleRoutes(app: FastifyInstance) {
    app.get("/", async (request, reply) => {
        try {
            const results = await db.select().from(circles).limit(50);
            return reply.send(createSuccessResponse(results));
        } catch (error) {
            app.log.error(error);
            // Fix unhandled promise rejection by properly catching and returning 500
            return reply.status(500).send(createErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    });
}
