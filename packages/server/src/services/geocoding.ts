import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { getRedisClient } from "../db/redis";

interface ReverseGeocodeResult {
    city?: string;
    state?: string;
    country?: string;
    formatted: string;
}

/**
 * Reverse-geocodes raw Lat/Lng into a human-readable Region string using OpenCage.
 * Falls back to "Unknown Location" if the API key is missing or the request fails.
 * Rate limited inherently by network calls, should be cached.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!env.OPENCAGE_API_KEY) {
        logger.warn("OPENCAGE_API_KEY is missing. Skipping reverse geocoding.");
        return "Unknown Region";
    }

    // Truncate lat/lng to ~1km accuracy (2 decimal places) for caching to group nearby requests
    const cacheKey = `geocode:${lat.toFixed(2)},${lng.toFixed(2)}`;
    const redis = getRedisClient();

    try {
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            return cachedResult; // Cache hit
        }

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${env.OPENCAGE_API_KEY}&no_annotations=1&language=en`;

        const response = await axios.get<any>(url);

        if (response.data && response.data.results && response.data.results.length > 0) {
            const components = response.data.results[0].components;

            const city = components.city || components.town || components.village || "";
            const state = components.state_code || components.state || "";
            const country = components.country_code ? components.country_code.toUpperCase() : "";

            // Format: "City, State, Country" parsing gracefully
            const parts = [city, state, country].filter(Boolean);
            let finalString = "Unknown Region";

            if (parts.length > 0) {
                finalString = parts.join(", ");
            } else {
                finalString = response.data.results[0].formatted || "Unknown Region";
            }

            // Cache result for 30 days (locations don't move)
            await redis.set(cacheKey, finalString, 'EX', 30 * 24 * 60 * 60);
            return finalString;
        }

        return "Unknown Location";
    } catch (error) {
        logger.error({ err: error, lat, lng }, "OpenCage Geocoding Failed");
        return "Unknown Location";
    }
}
