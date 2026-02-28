import { z } from "zod";

const nearbyRoomsQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(1).max(5000).default(50),
    interests: z.union([z.string(), z.array(z.string())]).optional()
        .transform(val => Array.isArray(val) ? val : (val ? [val] : []))
});

const payload1 = { lat: "40.7128", lng: "-74.0060" }; // missing radiusKm entirely
const payload2 = { lat: "40.7128", lng: "-74.0060", radiusKm: undefined }; // explicitly undefined radiusKm

console.log("Missing entirely:", JSON.stringify(nearbyRoomsQuerySchema.safeParse(payload1)));
console.log("Explicitly undefined:", JSON.stringify(nearbyRoomsQuerySchema.safeParse(payload2)));
