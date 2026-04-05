# Load Testing – IntelliCircle

k6-based load testing suite for validating WebSocket scalability, HTTP API throughput, and PostgreSQL query performance under production-like conditions.

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Windows (Chocolatey):**
```bash
choco install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

**Docker:**
```bash
docker run --rm -i grafana/k6 run - <load-tests/websocket-stress.js
```

### Server Requirements
- The Fastify server must be running at the target URL
- A test room must exist (default: Room ID `1`)
- Redis must be running for Pub/Sub and rate limiting

---

## Running Tests

### 1. WebSocket Stress Test

Simulates 5,000 concurrent WebSocket users joining rooms and sending messages.

```bash
# Default: Target localhost:8080, Room 1, messages every 5s
k6 run load-tests/websocket-stress.js

# Custom target
k6 run load-tests/websocket-stress.js \
  --env BASE_URL=https://api.intellicircle.com \
  --env WS_URL=wss://api.intellicircle.com \
  --env ROOM_ID=1 \
  --env MSG_INTERVAL=5

# Quick smoke test (override VU count)
k6 run load-tests/websocket-stress.js --vus 10 --duration 30s
```

**Key Thresholds:**
| Metric | Target | Description |
|--------|--------|-------------|
| `ws_broadcast_latency` | p95 < 100ms | Time from message send → broadcast receipt |
| `ws_connect_duration` | p95 < 2s | WebSocket handshake + JWT auth |
| `ws_connect_fail_rate` | < 5% | Connection establishment failures |

### 2. HTTP API Stress Test

Tests REST API endpoints: auth, spatial queries, and message history.

```bash
# Default: Target localhost:8080
k6 run load-tests/http-api-stress.js

# Custom target with coordinates (NYC)
k6 run load-tests/http-api-stress.js \
  --env BASE_URL=https://api.intellicircle.com \
  --env LAT=40.7128 \
  --env LNG=-73.9352 \
  --env RADIUS=25

# Run only the spatial query scenario
k6 run load-tests/http-api-stress.js --env SCENARIO=spatial
```

**Key Thresholds:**
| Metric | Target | Description |
|--------|--------|-------------|
| `auth_latency` | p95 < 500ms | Anonymous auth + JWT signing |
| `nearby_query_latency` | p95 < 800ms | PostGIS ST_DWithin spatial search |
| `history_query_latency` | p95 < 300ms | Indexed message hydration |
| `api_error_rate` | < 2% | Total API error rate |

---

## Interpreting Results

### Pass/Fail
k6 exits with code `0` when all thresholds pass, `99` when any threshold fails. Use this in CI:

```bash
k6 run load-tests/websocket-stress.js || echo "THRESHOLD BREACH DETECTED"
```

### Results Output
JSON results are saved to `load-tests/results/`:
- `ws-stress-result.json` – WebSocket test summary
- `http-stress-result.json` – HTTP test summary

### Memory Leak Detection
During the sustained plateau stage (10 minutes at 5,000 VUs), monitor:
```bash
# Server-side: Watch Node.js heap usage
watch -n 5 'curl -s localhost:8080/api/health | jq .'
```

Compare RSS memory at the start and end of the plateau. Growth >50MB over 10 minutes indicates a leak.

---

## CI Integration

Add to GitHub Actions:
```yaml
- name: Run Load Tests
  run: |
    k6 run packages/server/load-tests/http-api-stress.js \
      --env BASE_URL=${{ secrets.STAGING_API_URL }}
```

---

## Baseline Thresholds

These thresholds represent minimum acceptable performance for production deployment:

| Metric | Baseline | Stretch Goal |
|--------|----------|--------------|
| WS Broadcast Latency (p95) | < 100ms | < 50ms |
| WS Connect Duration (p95) | < 2s | < 500ms |
| Auth Latency (p95) | < 500ms | < 200ms |
| Spatial Query (p95) | < 800ms | < 300ms |
| History Query (p95) | < 300ms | < 100ms |
| Concurrent WS Connections | 5,000 | 10,000 |
| API Error Rate | < 2% | < 0.5% |
