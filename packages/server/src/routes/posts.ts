import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { posts } from "@intellicircle/shared";
import { eq } from "drizzle-orm";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function postRoutes(app: FastifyInstance) {
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const results = await db
                .select()
                .from(posts)
                .where(eq(posts.id, parseInt(id, 10)))
                .limit(1);

            if (results.length === 0) {
                return reply.status(404).send(createErrorResponse("Post not found", "POST_NOT_FOUND"));
            }

            return reply.send(createSuccessResponse(results[0]));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    });
}
