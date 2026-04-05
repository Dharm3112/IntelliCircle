import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// ─── Custom Metrics ──────────────────────────────────────────────────────────
const authLatency = new Trend('auth_latency', true);
const nearbyQueryLatency = new Trend('nearby_query_latency', true);
const historyQueryLatency = new Trend('history_query_latency', true);
const apiErrors = new Counter('api_errors');
const apiErrorRate = new Rate('api_error_rate');

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const TARGET_ROOM_ID = parseInt(__ENV.ROOM_ID || '1', 10);

// Test coordinates: San Francisco (37.7749, -122.4194)
const TEST_LAT = parseFloat(__ENV.LAT || '37.7749');
const TEST_LNG = parseFloat(__ENV.LNG || '-122.4194');
const TEST_RADIUS_KM = parseInt(__ENV.RADIUS || '50', 10);

// ─── Load Stages ─────────────────────────────────────────────────────────────
// Focuses on HTTP API throughput and PostGIS query performance
export const options = {
    scenarios: {
        // Scenario 1: Auth endpoint stress
        auth_stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 100 },
                { duration: '3m', target: 500 },
                { duration: '2m', target: 0 },
            ],
            exec: 'authScenario',
            tags: { scenario: 'auth' },
        },

        // Scenario 2: Spatial query stress (PostGIS ST_DWithin)
        spatial_stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 50 },
                { duration: '3m', target: 200 },
                { duration: '5m', target: 200 },  // Sustained for EXPLAIN ANALYZE validation
                { duration: '1m', target: 0 },
            ],
            exec: 'spatialQueryScenario',
            tags: { scenario: 'spatial' },
        },

        // Scenario 3: Message history hydration
        history_stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 50 },
                { duration: '3m', target: 300 },
                { duration: '2m', target: 0 },
            ],
            exec: 'historyScenario',
            tags: { scenario: 'history' },
        },
    },
    thresholds: {
        'auth_latency': ['p(95)<500'],                  // Auth under 500ms
        'nearby_query_latency': ['p(95)<800'],          // Spatial queries under 800ms
        'history_query_latency': ['p(95)<300'],         // Message history under 300ms (indexed)
        'api_error_rate': ['rate<0.02'],                 // Less than 2% errors
    },
};

// ─── Shared: Get Auth Token ──────────────────────────────────────────────────
function authenticate() {
    const username = `httptest_${__VU}_${Date.now()}`;
    const res = http.post(
        `${BASE_URL}/api/auth/anonymous`,
        JSON.stringify({ username }),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { name: 'auth' },
        }
    );

    authLatency.add(res.timings.duration);

    const ok = check(res, {
        'auth 200': (r) => r.status === 200,
    });

    if (!ok) {
        apiErrors.add(1);
        apiErrorRate.add(1);
        return null;
    }

    apiErrorRate.add(0);
    return JSON.parse(res.body).data.accessToken;
}

// ─── Scenario 1: Auth Endpoint Stress ────────────────────────────────────────
export function authScenario() {
    authenticate();
    sleep(0.5);
}

// ─── Scenario 2: Spatial Query Performance ───────────────────────────────────
// Tests the PostGIS ST_DWithin query that powers room discovery.
// This is the most expensive query and benefits from the GIST index.
export function spatialQueryScenario() {
    const token = authenticate();
    if (!token) return;

    // Add slight randomness to coordinates to avoid query cache hits
    const jitterLat = TEST_LAT + (Math.random() - 0.5) * 0.1;
    const jitterLng = TEST_LNG + (Math.random() - 0.5) * 0.1;

    const url = `${BASE_URL}/api/rooms/nearby?lat=${jitterLat}&lng=${jitterLng}&radiusKm=${TEST_RADIUS_KM}`;
    const res = http.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        tags: { name: 'nearby' },
    });

    nearbyQueryLatency.add(res.timings.duration);

    const ok = check(res, {
        'nearby 200': (r) => r.status === 200,
        'nearby has rooms array': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body).data.rooms);
            } catch {
                return false;
            }
        },
    });

    if (!ok) {
        apiErrors.add(1);
        apiErrorRate.add(1);
    } else {
        apiErrorRate.add(0);
    }

    sleep(1);
}

// ─── Scenario 3: Message History Hydration ───────────────────────────────────
// Tests the indexed composite query: SELECT * FROM messages WHERE room_id = X ORDER BY created_at DESC LIMIT 50
// This query should always use the `message_room_created_idx` index.
export function historyScenario() {
    const token = authenticate();
    if (!token) return;

    const res = http.get(`${BASE_URL}/api/rooms/${TARGET_ROOM_ID}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        tags: { name: 'history' },
    });

    historyQueryLatency.add(res.timings.duration);

    const ok = check(res, {
        'history 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    if (!ok) {
        apiErrors.add(1);
        apiErrorRate.add(1);
    } else {
        apiErrorRate.add(0);
    }

    sleep(0.5);
}

// ─── Summary Handler ─────────────────────────────────────────────────────────
export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        test: 'http-api-stress',
        metrics: {
            auth_latency_p95: data.metrics.auth_latency?.values?.['p(95)'] || 'N/A',
            nearby_query_latency_p95: data.metrics.nearby_query_latency?.values?.['p(95)'] || 'N/A',
            history_query_latency_p95: data.metrics.history_query_latency?.values?.['p(95)'] || 'N/A',
            api_errors: data.metrics.api_errors?.values?.count || 0,
            api_error_rate: data.metrics.api_error_rate?.values?.rate || 0,
        },
    };

    return {
        'stdout': JSON.stringify(summary, null, 2) + '\n',
        'load-tests/results/http-stress-result.json': JSON.stringify(summary, null, 2),
    };
}
