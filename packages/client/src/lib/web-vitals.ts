/**
 * Web Vitals Instrumentation
 *
 * Reports Core Web Vitals (LCP, INP, CLS) plus supplemental metrics (TTFB, FCP)
 * to PostHog as custom events for tracking frontend performance over time.
 *
 * These metrics feed into PostHog's dashboard where we can track:
 * - LCP (Largest Contentful Paint): Should be < 2.5s for "good"
 * - FID (First Input Delay): Should be < 100ms for "good"  
 * - CLS (Cumulative Layout Shift): Should be < 0.1 for "good"
 * - TTFB (Time to First Byte): Server response time
 * - FCP (First Contentful Paint): Time to first render
 *
 * INP (Interaction to Next Paint) replaces FID in modern Chrome.
 */

import { onLCP, onCLS, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';
import posthog from 'posthog-js';

function sendToPostHog(metric: Metric) {
    // Only emit if PostHog is initialized
    if (typeof window === 'undefined') return;

    posthog.capture('web_vital', {
        name: metric.name,           // e.g., 'LCP', 'FID', 'CLS'
        value: metric.value,          // numeric value
        rating: metric.rating,        // 'good', 'needs-improvement', or 'poor'
        delta: metric.delta,          // change since last report
        id: metric.id,                // unique ID per metric instance
        navigationType: metric.navigationType, // 'navigate', 'reload', 'back-forward', etc.
    });
}

export function reportWebVitals(): void {
    try {
        onLCP(sendToPostHog);
        onCLS(sendToPostHog);
        onTTFB(sendToPostHog);
        onFCP(sendToPostHog);
        onINP(sendToPostHog);
    } catch (err) {
        // Silently fail – analytics should never crash the app
        console.warn('[WebVitals] Failed to initialize:', err);
    }
}
