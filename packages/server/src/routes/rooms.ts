import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { chatRooms, createRoomSchema, nearbyRoomsQuerySchema } from "@intellicircle/shared";
import { reverseGeocode } from "../services/geocoding";
import { createSuccessResponse, createErrorResponse } from "../utils/response";
import { sql } from "drizzle-orm";

export async function roomRoutes(app: FastifyInstance) {
    // 1. Create a New Room with Location
    app.post("/", { preValidation: [app.authenticate] }, async (request, reply) => {
        const payload = createRoomSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { name, description, lat, lng, interests } = payload.data;

        try {
            // Translate the Lat/Lng into a human string via OpenCage
            const regionString = await reverseGeocode(lat, lng);

            // Construct PostGIS Geometry Point using Raw SQL wrapper
            // ST_SetSRID(ST_MakePoint(lng, lat), 4326) -> Longitude FIRST in PostGIS MakePoint
            const locationPoint = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

            const [newRoom] = await db.insert(chatRooms).values({
                name,
                description,
                interests,
                location: locationPoint as any, // Bypass strict type check for now until drizzle natively supports inserting into custom geometries
                // We're dynamically adding a region string column next migration to hold OpenCage result. 
                // Currently just making sure the spatial bounds store.
            }).returning();

            return reply.status(201).send(createSuccessResponse({
                room: newRoom,
                resolvedRegion: regionString
            }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to create room"));
        }
    });

    // 2. Discover Nearby Rooms
    app.get("/nearby", { preValidation: [app.authenticate] }, async (request, reply) => {
        const payload = nearbyRoomsQuerySchema.safeParse(request.query);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid query parameters", "VALIDATION_ERROR", payload.error.format()));
        }

        const { lat, lng, radiusKm, interests } = payload.data;

        try {
            // Convert Radius from Kilometers to Meters (ST_DWithin expects meters when using geography features)
            const radiusMeters = radiusKm * 1000;

            // Base spatial query: Find rooms where the room's location is within X meters of the user's location
            // We cast the reference point to `geography` so ST_DWithin calculates distance over the curvature of the earth (meters)
            // ST_MakePoint takes (Longitude, Latitude)
            const conditions = [
                sql`ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})`,
                sql`is_active = 1` // Only show active rooms
            ];

            // Overlay Interest Filtering if array provided (Intersection operator @>)
            if (interests && interests.length > 0) {
                conditions.push(sql`interests @> ${JSON.stringify(interests)}::jsonb`);
            }

            // Combine all where clauses dynamically
            const whereClause = sql.join(conditions, sql` AND `);

            // Execute Query mapping distance for sorting
            const nearbyRooms = await db.select({
                id: chatRooms.id,
                name: chatRooms.name,
                description: chatRooms.description,
                interests: chatRooms.interests,
                createdAt: chatRooms.createdAt,
                // Calculate distance from user in meters for the payload
                distanceMeters: sql<number>`ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
            })
                .from(chatRooms)
                .where(whereClause)
                .orderBy(sql`distanceMeters ASC`) // Sort by closest first
                .limit(50); // Show top 50 matches

            return reply.status(200).send(createSuccessResponse({ rooms: nearbyRooms, searchRadius: radiusKm }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to discover nearby rooms"));
        }
    });
}
