-- ══════════════════════════════════════════════════════════════
-- GHS MBONJO LIMBE — CS e-Learning Platform
-- Teacher: Mr Ngwana Joshua
-- Run this SQL in Supabase → SQL Editor → New Query → Run
-- ══════════════════════════════════════════════════════════════

-- TABLE 1: Student login sessions
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  cin           TEXT NOT NULL,
  name          TEXT NOT NULL,
  login_time    TIMESTAMPTZ DEFAULT NOW(),
  login_timestamp BIGINT,
  logout_time   TIMESTAMPTZ,
  duration      INTEGER,         -- seconds
  ip            TEXT,
  location      TEXT,            -- "lat,lng" string from geolocation
  device_type   TEXT,            -- mobile / tablet / desktop
  device_label  TEXT,            -- 📱 Phone (Samsung) etc.
  browser       TEXT,            -- Chrome 120
  os            TEXT             -- Android 13
);

-- TABLE 2: Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id      BIGSERIAL PRIMARY KEY,
  cin     TEXT NOT NULL,
  name    TEXT NOT NULL,
  topic   TEXT,
  score   INTEGER,               -- percentage 0-100
  correct INTEGER,
  total   INTEGER,
  date    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: Structured question grades (Paper 2)
CREATE TABLE IF NOT EXISTS structured_grades (
  id         BIGSERIAL PRIMARY KEY,
  cin        TEXT NOT NULL,
  name       TEXT,
  q_index    INTEGER NOT NULL,   -- question number (0-based)
  part_index INTEGER NOT NULL,   -- part number (0-based)
  grade      INTEGER,
  max_marks  INTEGER,
  date       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cin, q_index, part_index)  -- prevents duplicate grades
);

-- Enable Row Level Security but allow all operations (server uses service key)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE structured_grades ENABLE ROW LEVEL SECURITY;

-- Allow all access (our server authenticates via the secret key)
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON quiz_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON structured_grades FOR ALL USING (true) WITH CHECK (true);

-- Useful indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_sessions_cin ON sessions(cin);
CREATE INDEX IF NOT EXISTS idx_sessions_login_time ON sessions(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_cin ON quiz_results(cin);
CREATE INDEX IF NOT EXISTS idx_quiz_date ON quiz_results(date DESC);

-- Done! All 3 tables created.
-- Next: go back to Railway and set environment variables:
--   SUPABASE_URL = https://your-project.supabase.co
--   SUPABASE_KEY = your-service-role-key
