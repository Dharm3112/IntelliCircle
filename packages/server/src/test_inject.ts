import { buildApp } from "./app";

async function run() {
    const app = await buildApp();
    await app.ready();

    console.log("-> Testing Anonymous Login...");
    const authRes = await app.inject({
        method: 'POST',
        url: '/api/auth/anonymous',
        payload: { username: 'testuser' }
    });
    console.log("Auth Status:", authRes.statusCode);

    if (authRes.statusCode !== 200 && authRes.statusCode !== 201) {
        console.error("Login failed:", authRes.json());
        process.exit(1);
    }

    const token = authRes.json().data.accessToken;

    console.log("\n-> Testing /api/rooms/nearby...");
    const nearbyRes = await app.inject({
        method: 'GET',
        url: '/api/rooms/nearby',
        query: { lat: '40', lng: '-74', radiusKm: '50' },
        headers: { authorization: `Bearer ${token}` }
    });
    console.log("Nearby Status:", nearbyRes.statusCode);
    if (nearbyRes.statusCode >= 400) console.log("Nearby Error:", nearbyRes.json());

    console.log("\n-> Testing /api/rooms/global...");
    const globalRes = await app.inject({
        method: 'GET',
        url: '/api/rooms/global',
        headers: { authorization: `Bearer ${token}` }
    });
    console.log("Global Status:", globalRes.statusCode);
    if (globalRes.statusCode >= 400) console.log("Global Error:", globalRes.json());

    process.exit(0);
}

run().catch(console.error);
