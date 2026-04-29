-- ============================================================
--  HEALTH AI Co-Creation Platform — Database Schema
--  Idempotent: safe to run multiple times (IF NOT EXISTS / DO blocks)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM TYPES ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'healthcare_professional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'active', 'meeting_scheduled', 'partner_found', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  role          user_role    NOT NULL,
  institution   VARCHAR(255),
  is_suspended  BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── POSTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(255) NOT NULL,
  domain              VARCHAR(100) NOT NULL,
  required_expertise  VARCHAR(100) NOT NULL,
  stage               VARCHAR(100) NOT NULL,
  city                VARCHAR(100) NOT NULL,
  description         TEXT         NOT NULL,
  status              post_status  NOT NULL DEFAULT 'draft',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── MEETING REQUESTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meeting_requests (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        UUID           NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requester_id   UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nda_accepted   BOOLEAN        NOT NULL,
  proposed_slots JSONB          NOT NULL,
  accepted_slot  TIMESTAMPTZ,
  status         meeting_status NOT NULL DEFAULT 'pending',
  message        TEXT,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_nda CHECK (nda_accepted = true)
);

-- ── AUDIT LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action      VARCHAR(100) NOT NULL,
  actor_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_status             ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_domain             ON posts(domain);
CREATE INDEX IF NOT EXISTS idx_posts_city               ON posts(city);
CREATE INDEX IF NOT EXISTS idx_posts_expertise          ON posts(required_expertise);
CREATE INDEX IF NOT EXISTS idx_posts_owner              ON posts(owner_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_post    ON meeting_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_req     ON meeting_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created       ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor         ON audit_logs(actor_id);
