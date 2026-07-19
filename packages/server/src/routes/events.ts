import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { events } from "@intellicircle/shared";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export async function eventRoutes(app: FastifyInstance) {
    /**
     * @api {get} /api/v1/events/nearby Request Nearby Events
     * @apiName GetNearbyEvents
     * @apiGroup Events
     *
     * @apiParam {Number} lat Latitude of the location.
     * @apiParam {Number} lng Longitude of the location.
     * @apiParam {Number} [radius=10] Search radius in kilometers.
     *
     * @apiSuccess {Object[]} events List of events.
     */
    app.get("/nearby", async (request, reply) => {
        try {
            // A simple implementation fetching first 50 events for scaffolding
            const results = await db
                .select()
                .from(events)
                .limit(50);
            return reply.send(createSuccessResponse(results));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    });
}
