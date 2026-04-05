/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' fonts.googleapis.com;
    font-src 'self' fonts.gstatic.com;
    img-src 'self' blob: data: https:;
    media-src 'none';
    connect-src 'self' ws: wss: http: https:;
    object-src 'none';
    frame-src 'none';
`;

// ─── Edge Caching Headers ────────────────────────────────────────────────────
// Non-authenticated, marketing/static routes are aggressively cached at the CDN edge.
// - s-maxage: CDN cache duration (shared cache)
// - stale-while-revalidate: Serve stale content while revalidating in the background
//
// Authenticated app routes (`/discover`, `/chat`, `/dashboard`, `/profile`)
// are NOT cached – they use default no-cache behavior.
const EDGE_CACHE_HEADER = {
    key: 'Cache-Control',
    value: 'public, s-maxage=3600, stale-while-revalidate=86400',
};

const SECURITY_HEADERS = [
    {
        key: "Content-Security-Policy",
        value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
];

const nextConfig = {
    async headers() {
        return [
            // Global security headers on all routes
            {
                source: "/(.*)",
                headers: SECURITY_HEADERS,
            },

            // ─── Edge Caching: Static/Marketing Pages ────────────────────
            // These pages have no user-specific content and are safe to cache aggressively.
            {
                source: "/",
                headers: [EDGE_CACHE_HEADER],
            },
            {
                source: "/about",
                headers: [EDGE_CACHE_HEADER],
            },
            {
                source: "/terms",
                headers: [EDGE_CACHE_HEADER],
            },
            {
                source: "/privacy",
                headers: [EDGE_CACHE_HEADER],
            },
            {
                source: "/contact",
                headers: [EDGE_CACHE_HEADER],
            },
            {
                source: "/waitlist",
                headers: [EDGE_CACHE_HEADER],
            },
        ];
    },
};

// Wrap with bundle analyzer when ANALYZE=true
const analyzedConfig = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default analyzedConfig;
