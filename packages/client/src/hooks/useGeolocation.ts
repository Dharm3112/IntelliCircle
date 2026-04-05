import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";

interface LocationState {
    coordinates: { lat: number; lng: number } | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [location, setLocation] = useState<LocationState>({
        coordinates: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setLocation({
                coordinates: null,
                error: "Geolocation is not supported by your browser.",
                loading: false,
            });
            return;
        }

        const successHandler = (position: GeolocationPosition) => {
            setLocation({
                coordinates: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                },
                error: null,
                loading: false,
            });

            // Emit product KPI event: user granted location access
            // We intentionally do NOT send raw lat/lng to analytics – only that the event occurred
            analytics.locationGranted();
        };

        const errorHandler = (error: GeolocationPositionError) => {
            let errorMessage = "An unknown geographic error occurred.";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "The request to get user location timed out.";
                    break;
            }
            setLocation({ coordinates: null, error: errorMessage, loading: false });
        };

        // Attempt highest accuracy with a 10-second timeout
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    }, []);

    return location;
}
