-- MoodMap: moods table + users table
-- Run this SQL in your Supabase SQL Editor

-- ── Users table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mm_users (
  address       TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL DEFAULT '',
  streak        INTEGER NOT NULL DEFAULT 0,
  best_streak   INTEGER NOT NULL DEFAULT 0,
  total_logs    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mm_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read users" ON mm_users FOR SELECT USING (true);
CREATE POLICY "Service role can write users" ON mm_users FOR ALL USING (true);

-- ── Moods table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moods (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL REFERENCES mm_users(address),
  mood         TEXT NOT NULL CHECK (mood IN (
    'happy','neutral','sad','angry','tired','excited','anxious','peaceful'
  )),
  country_code TEXT NOT NULL DEFAULT 'XX',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1日1回制限: same user_address, same calendar day
CREATE UNIQUE INDEX IF NOT EXISTS moods_user_day
  ON moods (user_address, (created_at AT TIME ZONE 'UTC')::date);

-- Index for map aggregation (country + date)
CREATE INDEX IF NOT EXISTS moods_country_date
  ON moods (country_code, (created_at AT TIME ZONE 'UTC')::date);

ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read moods" ON moods FOR SELECT USING (true);
CREATE POLICY "Service role can write moods" ON moods FOR ALL USING (true);
