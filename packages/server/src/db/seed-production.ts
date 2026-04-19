import { db } from "./index";
import { chatRooms } from "@intellicircle/shared";
import { env } from "../config/env";

/**
 * Production Seed Script
 * Solves the "cold start" problem by ensuring major global virtual hubs exist.
 * This script is IDEMPOTENT - it uses ON CONFLICT DO NOTHING, so it is safe
 * to run multiple times in production without duplicating or deleting data.
 */
const seedProduction = async () => {
    console.log(`🌍 Seeding PRODUCTION Virtual Rooms to: ${env.DATABASE_URL}...`);

    try {
        const virtualRooms = [
            {
                name: "NYC Tech Enthusiasts",
                description: "Local tech meetups and info in New York. A global hub.",
                location: { x: -74.0060, y: 40.7128 },
                interests: ["tech", "startups", "nyc", "software"],
                isActive: 1,
            },
            {
                name: "SF Developers Hub",
                description: "Bay area software engineering chat. A global hub.",
                location: { x: -122.4194, y: 37.7749 },
                interests: ["software", "engineering", "sf", "silicon valley"],
                isActive: 1,
            },
            {
                name: "London FinTech",
                description: "Discussions surrounding financial technology in London. A global hub.",
                location: { x: -0.1276, y: 51.5072 },
                interests: ["finance", "tech", "london", "fintech"],
                isActive: 1,
            },
            {
                name: "Tokyo AI Research",
                description: "Deep learning and robotics innovation. A global hub.",
                location: { x: 139.6917, y: 35.6895 },
                interests: ["ai", "robotics", "machine learning", "tokyo"],
                isActive: 1,
            },
            {
                name: "Berlin Web3 Hackers",
                description: "Blockchain, crypto, and decentralization. A global hub.",
                location: { x: 13.4050, y: 52.5200 },
                interests: ["crypto", "web3", "blockchain", "berlin"],
                isActive: 1,
            },
            {
                name: "Mumbai Founders",
                description: "Startup founders and VC networking. A global hub.",
                location: { x: 72.8777, y: 19.0760 },
                interests: ["startups", "vc", "founders", "mumbai"],
                isActive: 1,
            },
            {
                name: "Sydney DevOps",
                description: "Cloud infrastructure and SRE networking. A global hub.",
                location: { x: 151.2093, y: -33.8688 },
                interests: ["devops", "cloud", "aws", "sydney"],
                isActive: 1,
            },
            {
                name: "Toronto Game Dev",
                description: "Indie and AAA game development scene. A global hub.",
                location: { x: -79.3832, y: 43.6532 },
                interests: ["gamedev", "unity", "unreal", "toronto"],
                isActive: 1,
            },
            {
                name: "São Paulo Creators",
                description: "Digital creators, designers, and marketing. A global hub.",
                location: { x: -46.6333, y: -23.5505 },
                interests: ["design", "marketing", "creators", "saopaulo"],
                isActive: 1,
            },
            {
                name: "Dubai Real Estate Tech",
                description: "PropTech and real estate innovation. A global hub.",
                location: { x: 55.2708, y: 25.2048 },
                interests: ["proptech", "realestate", "dubai", "tech"],
                isActive: 1,
            }
        ];

        let insertedCount = 0;

        for (const room of virtualRooms) {
            // Using Drizzle's ON CONFLICT DO NOTHING by checking if room exists by name
            // (Assumes room names are a good proxy for uniqueness here, 
            // alternatively you could catch unique constraint errors).
            await db.insert(chatRooms).values(room).onConflictDoNothing();
            insertedCount++;
        }

        console.log(`✅ Attempted to seed ${insertedCount} global hubs (existing ones were ignored).`);

    } catch (e) {
        console.error("❌ Production Seeding failed!");
        console.error(e);
        process.exit(1);
    } finally {
        process.exit(0);
    }
};

seedProduction();
