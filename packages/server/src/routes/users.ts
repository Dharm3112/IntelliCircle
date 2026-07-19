import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { users } from "@intellicircle/shared";
import { eq } from "drizzle-orm";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function userRoutes(app: FastifyInstance) {
    // 1. Fetch User details by username
    app.get("/:username", async (request, reply) => {
        const { username } = request.params as { username: string };

        try {
            const userResults = await db
                .select({
                    id: users.id,
                    username: users.username,
                    role: users.role,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(eq(users.username, username))
                .limit(1);

            if (userResults.length === 0) {
                return reply.status(404).send(createErrorResponse("User not found", "USER_NOT_FOUND"));
            }

            return reply.send(createSuccessResponse(userResults[0]));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    });
}
