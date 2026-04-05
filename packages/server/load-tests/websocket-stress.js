import ws from 'k6/ws';
import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Counter, Trend, Rate, Gauge } from 'k6/metrics';

// ─── Custom Metrics ──────────────────────────────────────────────────────────
const wsConnectDuration = new Trend('ws_connect_duration', true);
const wsBroadcastLatency = new Trend('ws_broadcast_latency', true);
const wsMessagesSent = new Counter('ws_messages_sent');
const wsMessagesReceived = new Counter('ws_messages_received');
const wsErrors = new Counter('ws_errors');
const wsConnectFailRate = new Rate('ws_connect_fail_rate');
const activeConnections = new Gauge('ws_active_connections');

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const WS_URL = __ENV.WS_URL || BASE_URL.replace('http', 'ws');
const TARGET_ROOM_ID = parseInt(__ENV.ROOM_ID || '1', 10);
const MESSAGE_INTERVAL_SEC = parseInt(__ENV.MSG_INTERVAL || '5', 10);

// ─── Load Stages ─────────────────────────────────────────────────────────────
// Ramps from 0 → 5,000 concurrent VUs with sustained plateau and graceful drain.
//
// Stage 1: Warm-up (2 min) – Ramp to 500 to establish baseline
// Stage 2: Scale-up (3 min) – Ramp to 2,500
// Stage 3: Full load (5 min) – Ramp to 5,000 and sustain
// Stage 4: Sustained plateau (10 min) – Hold 5,000 for memory leak detection
// Stage 5: Cool-down (2 min) – Drain to 0
export const options = {
    stages: [
        { duration: '2m', target: 500 },
        { duration: '3m', target: 2500 },
        { duration: '5m', target: 5000 },
        { duration: '10m', target: 5000 },  // Sustained hold for leak detection
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        'ws_connect_duration': ['p(95)<2000'],          // 95% of WS connects under 2s
        'ws_broadcast_latency': ['p(95)<100'],          // EXIT CRITERIA: <100ms broadcast latency
        'ws_connect_fail_rate': ['rate<0.05'],           // Less than 5% connection failures
        'http_req_duration{name:auth}': ['p(95)<500'],  // Auth endpoint under 500ms
    },
};

// ─── Helper: Authenticate and get JWT ────────────────────────────────────────
function getAuthToken(vuId) {
    const username = `loadtest_vu_${vuId}_${Date.now()}`;
    const res = http.post(
        `${BASE_URL}/api/auth/anonymous`,
        JSON.stringify({ username }),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { name: 'auth' },
        }
    );

    const authOk = check(res, {
        'auth status 200': (r) => r.status === 200,
        'auth has accessToken': (r) => {
            try {
                return JSON.parse(r.body).data.accessToken !== undefined;
            } catch {
                return false;
            }
        },
    });

    if (!authOk) {
        wsErrors.add(1);
        fail(`Authentication failed for VU ${vuId}: ${res.status} ${res.body}`);
    }

    return JSON.parse(res.body).data.accessToken;
}

// ─── Main VU Function ────────────────────────────────────────────────────────
export default function () {
    const vuId = __VU;
    const token = getAuthToken(vuId);

    const wsUrl = `${WS_URL}/ws?token=${token}`;
    const connectStart = Date.now();

    const res = ws.connect(wsUrl, {}, function (socket) {
        const connectElapsed = Date.now() - connectStart;
        wsConnectDuration.add(connectElapsed);
        activeConnections.add(1);

        let connected = false;

        socket.on('open', () => {
            connected = true;
            wsConnectFailRate.add(0); // Success

            // 1. Join the target room
            socket.send(JSON.stringify({
                type: 'join_room',
                payload: { roomId: TARGET_ROOM_ID },
            }));
        });

        socket.on('message', (data) => {
            wsMessagesReceived.add(1);

            try {
                const msg = JSON.parse(data);

                // Measure broadcast latency: time between when we sent a message
                // and when we receive it back via Redis Pub/Sub
                if (msg.type === 'new_message' && msg.payload && msg.payload.createdAt) {
                    const serverTimestamp = new Date(msg.payload.createdAt).getTime();
                    const now = Date.now();
                    // Only measure if timestamps are reasonably close (clock sync)
                    if (Math.abs(now - serverTimestamp) < 60000) {
                        wsBroadcastLatency.add(now - serverTimestamp);
                    }
                }
            } catch (e) {
                // Non-JSON messages are fine (pings, etc.)
            }
        });

        socket.on('error', (e) => {
            wsErrors.add(1);
            console.error(`WS Error VU ${vuId}: ${e.error()}`);
        });

        socket.on('close', () => {
            activeConnections.add(-1);
        });

        // 2. Send messages at the specified interval for the duration of the test
        // Each VU sends a message every MESSAGE_INTERVAL_SEC seconds
        socket.setInterval(() => {
            if (socket.readyState === 1) { // OPEN
                const payload = {
                    type: 'send_message',
                    payload: {
                        roomId: TARGET_ROOM_ID,
                        content: `Load test message from VU ${vuId} at ${new Date().toISOString()}`,
                    },
                };
                socket.send(JSON.stringify(payload));
                wsMessagesSent.add(1);
            }
        }, MESSAGE_INTERVAL_SEC * 1000);

        // 3. Keep the connection alive for the full stage duration
        // k6 will close the socket when the VU iteration ends
        // Sleep for the stage duration minus a small buffer
        socket.setTimeout(() => {
            socket.close(1000);
        }, 60000); // Each VU holds connection for 60s then reconnects
    });

    // Track failed connections
    if (res.status !== 101) {
        wsConnectFailRate.add(1);
        wsErrors.add(1);
    }

    // Brief pause between reconnection attempts
    sleep(1);
}

// ─── Teardown: Print Summary ─────────────────────────────────────────────────
export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        test: 'websocket-stress',
        thresholds: data.root_group ? data.root_group.thresholds : {},
        metrics: {
            ws_connect_duration_p95: data.metrics.ws_connect_duration?.values?.['p(95)'] || 'N/A',
            ws_broadcast_latency_p95: data.metrics.ws_broadcast_latency?.values?.['p(95)'] || 'N/A',
            ws_messages_sent: data.metrics.ws_messages_sent?.values?.count || 0,
            ws_messages_received: data.metrics.ws_messages_received?.values?.count || 0,
            ws_errors: data.metrics.ws_errors?.values?.count || 0,
            ws_connect_fail_rate: data.metrics.ws_connect_fail_rate?.values?.rate || 0,
        },
    };

    return {
        'stdout': JSON.stringify(summary, null, 2) + '\n',
        'load-tests/results/ws-stress-result.json': JSON.stringify(summary, null, 2),
    };
}
