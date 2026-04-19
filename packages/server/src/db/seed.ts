import { db } from "./index";
import { users, chatRooms } from "@intellicircle/shared";
import { env } from "../config/env";

const seed = async () => {
    console.log(`🌱 Seeding database at ${env.DATABASE_URL}...`);

    try {
        // Clear existing data (optional, be careful in production!)
        await db.delete(users);
        await db.delete(chatRooms);

        console.log("Creating dummy users...");
        const insertedUsers = await db.insert(users).values([
            { username: "alice_nyc" },
            { username: "bob_sf" },
            { username: "charlie_lon" },
        ]).returning();

        console.log(`Created ${insertedUsers.length} users.`);

        console.log("Creating dummy chat rooms...");
        // Example coordinates (Longitude, Latitude)
        // NYC: -74.0060, 40.7128
        // SF: -122.4194, 37.7749
        // London: -0.1276, 51.5072

        const insertedRooms = await db.insert(chatRooms).values([
            {
                name: "NYC Tech Enthusiasts",
                description: "Local tech meetups and info in New York",
                location: { x: -74.0060, y: 40.7128 },
                interests: ["tech", "startups", "nyc"],
            },
            {
                name: "SF Developers Hub",
                description: "Bay area software engineering chat",
                location: { x: -122.4194, y: 37.7749 },
                interests: ["software", "engineering", "sf", "sv"],
            },
            {
                name: "London FinTech",
                description: "Discussions surrounding financial technology in London",
                location: { x: -0.1276, y: 51.5072 },
                interests: ["finance", "tech", "london"],
            },
        ]).returning();

        console.log(`Created ${insertedRooms.length} chat rooms.`);
        console.log("✅ Seeding complete.");

    } catch (e) {
        console.error("❌ Seeding failed!");
        console.error(e);
    } finally {
        process.exit();
    }
};

seed();
