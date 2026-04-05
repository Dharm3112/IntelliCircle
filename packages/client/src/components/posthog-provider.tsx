'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React, { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

// Safely initialize PostHog avoiding SSR crashes if env is missing
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false, // Disabling automatic pageview capture, as we capture manually in Next.js routing
        capture_pageleave: true,
        autocapture: true, // Captures clicks and form submissions
        person_profiles: 'identified_only',
        // Enable web vitals tracking natively
        capture_performance: true,
    });
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    // Initialize Web Vitals reporting after the provider mounts on the client
    useEffect(() => {
        reportWebVitals();
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
