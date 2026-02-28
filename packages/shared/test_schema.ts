import { z } from "zod";

const nearbyRoomsQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(1).max(5000).default(50),
    interests: z.union([z.string(), z.array(z.string())]).optional()
        .transform(val => Array.isArray(val) ? val : (val ? [val] : []))
});

const payload = {
    lat: "40.7128",
    lng: "-74.0060",
    radiusKm: "50"
};

const result = nearbyRoomsQuerySchema.safeParse(payload);
console.log("Validation Result:", JSON.stringify(result, null, 2));

const payloadWithInterests = { lat: 40, lng: -74, radiusKm: 50, interests: "ai" };
console.log("With Interests:", JSON.stringify(nearbyRoomsQuerySchema.safeParse(payloadWithInterests), null, 2));
