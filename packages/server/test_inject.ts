import { buildApp } from "./src/app";
import { db } from "./src/db/index";
import { chatRooms } from "@intellicircle/shared/src/schema";
import { eq } from "drizzle-orm";

async function run() {
    const app = await buildApp();

    // App Inject
    try {
        const res1 = await app.inject({
            method: 'POST',
            url: '/api/auth/anonymous',
            payload: { username: 'test_injector_1234' }
        });
        const token = JSON.parse(res1.payload).data.accessToken;

        const res2 = await app.inject({
            method: 'GET',
            url: '/api/rooms/nearby?lat=40.7128&lng=-74.0060&radiusKm=50',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Nearby Route Output:", res2.payload);
    } catch (e) {
        console.error("Inject Error:", e);
    }

    process.exit(0);
}

run();
