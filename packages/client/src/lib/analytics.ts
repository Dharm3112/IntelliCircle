/**
 * Centralized Analytics Helper
 *
 * All product KPI events flow through this module to ensure consistent
 * naming, PII safety, and a single point of control for analytics.
 *
 * Privacy rules:
 * - NEVER send raw coordinates (lat/lng) to analytics
 * - NEVER send raw email addresses; only hashed identifiers if needed
 * - Only send region/city-level location data
 */

import posthog from 'posthog-js';

function isReady(): boolean {
    return typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export const analytics = {
    /**
     * Fired when a user successfully submits the waitlist form.
     * We intentionally do NOT log the raw email – only that the event occurred.
     */
    waitlistJoined: () => {
        if (!isReady()) return;
        posthog.capture('waitlist_joined', {
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Fired when the browser Geolocation API successfully returns coordinates.
     * We only forward the resolved city/region, NEVER raw lat/lng.
     */
    locationGranted: (region?: string) => {
        if (!isReady()) return;
        posthog.capture('location_granted', {
            region: region || 'unknown',
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Fired when a user sends a `join_room` WebSocket message.
     */
    roomJoined: (roomId: number) => {
        if (!isReady()) return;
        posthog.capture('room_joined', {
            room_id: roomId,
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Fired when a user sends a `send_message` WebSocket message.
     * We do NOT log message content – only the event and room context.
     */
    messageSent: (roomId: number) => {
        if (!isReady()) return;
        posthog.capture('message_sent', {
            room_id: roomId,
            timestamp: new Date().toISOString(),
        });
    },
};
