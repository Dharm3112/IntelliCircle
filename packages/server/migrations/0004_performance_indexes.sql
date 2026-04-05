-- Migration: 0004_performance_indexes
-- Phase 11: Performance Optimization & Load Testing
--
-- Adds critical indexes for production performance under high concurrency.
-- These should be run BEFORE load testing to establish optimal query plans.

-- ─── 1. PostGIS GIST Index on chatRooms.location ─────────────────────────────
-- Accelerates the ST_DWithin and ST_Distance spatial queries used by
-- GET /api/rooms/nearby. Without this, PostGIS performs a sequential scan
-- on every row, which becomes O(n) as room count grows.
--
-- EXPLAIN ANALYZE expected change:
--   BEFORE: Seq Scan on "chatRooms" (cost=0.00..X rows=Y)
--   AFTER:  Index Scan using chatrooms_location_gist_idx (cost=0.00..X rows=Y)
CREATE INDEX IF NOT EXISTS chatrooms_location_gist_idx
    ON "chatRooms" USING GIST (location);

-- ─── 2. Partial Index on Active Rooms ────────────────────────────────────────
-- Most queries filter by is_active = 1 (discovery, global rooms).
-- A partial index only indexes active rows, keeping the index small and fast.
-- This is especially useful after Phase 8's DeadRoomCleanup archives rooms.
CREATE INDEX IF NOT EXISTS chatrooms_active_idx
    ON "chatRooms" (is_active)
    WHERE is_active = 1;

-- ─── 3. Covering Index: Active Rooms by Creation Date ────────────────────────
-- Optimizes GET /api/rooms/global which does:
-- SELECT ... FROM chatRooms WHERE is_active = 1 ORDER BY created_at DESC LIMIT 50
-- The composite (is_active, created_at DESC) allows an index-only scan.
CREATE INDEX IF NOT EXISTS chatrooms_active_created_idx
    ON "chatRooms" (is_active, created_at DESC)
    WHERE is_active = 1;

-- ─── 4. Audit Logs Time-Range Index ──────────────────────────────────────────
-- Allows efficient time-range queries on the auth audit trail.
-- Used for security dashboards and incident investigation.
CREATE INDEX IF NOT EXISTS auth_audit_logs_created_idx
    ON "auth_audit_logs" (created_at DESC);

-- ─── 5. Geography Cast Index for Distance Sorting ────────────────────────────
-- The nearby rooms query casts location::geography for ST_Distance sorting.
-- A functional index on the geography cast avoids repeated casting per row.
-- Note: This requires PostGIS 2.x+ and may require IMMUTABLE function wrapper
-- on some PostgreSQL versions. If this fails, remove this index – the GIST
-- index above is sufficient for the WHERE clause optimization.
CREATE INDEX IF NOT EXISTS chatrooms_location_geography_idx
    ON "chatRooms" USING GIST ((location::geography));

-- ─── Verification Queries ────────────────────────────────────────────────────
-- Run these after migration to verify indexes are being used:
--
-- 1. Spatial query plan (should show GIST index scan):
--    EXPLAIN ANALYZE
--    SELECT id, name FROM "chatRooms"
--    WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography, 50000)
--    AND is_active = 1
--    ORDER BY ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography) ASC
--    LIMIT 50;
--
-- 2. Message history plan (should show index scan on message_room_created_idx):
--    EXPLAIN ANALYZE
--    SELECT * FROM messages WHERE room_id = 1 ORDER BY created_at DESC LIMIT 50;
--
-- 3. Global rooms plan (should show chatrooms_active_created_idx):
--    EXPLAIN ANALYZE
--    SELECT id, name FROM "chatRooms" WHERE is_active = 1 ORDER BY created_at DESC LIMIT 50;
