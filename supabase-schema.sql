-- =============================================
-- TRENCHES & DRAGONS - Supabase Database Schema
-- =============================================
-- All tables prefixed with "td_" to avoid conflicts with other projects
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Sessions table - tracks game sessions
CREATE TABLE IF NOT EXISTS td_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  entry_sig TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'claimed')),
  score INTEGER DEFAULT 0,
  seed TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_td_sessions_player ON td_sessions(player);
CREATE INDEX IF NOT EXISTS idx_td_sessions_entry_sig ON td_sessions(entry_sig);
CREATE INDEX IF NOT EXISTS idx_td_sessions_status ON td_sessions(status);

-- Claims table - tracks reward claims
CREATE TABLE IF NOT EXISTS td_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES td_sessions(id),
  claim_sig TEXT,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_td_claims_player ON td_claims(player);
CREATE INDEX IF NOT EXISTS idx_td_claims_session_id ON td_claims(session_id);
CREATE INDEX IF NOT EXISTS idx_td_claims_status ON td_claims(status);

-- Settings table - key-value store for game configuration
CREATE TABLE IF NOT EXISTS td_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Used signatures table - prevents replay attacks
CREATE TABLE IF NOT EXISTS td_used_signatures (
  signature TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  player TEXT NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_td_used_signatures_player ON td_used_signatures(player);

-- Insert default settings
INSERT INTO td_settings (key, value) VALUES
  ('entryFee', '1000000'),
  ('rewardAmount', '500000'),
  ('treasuryPublicKey', '4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA'),
  ('difficulty', 'normal'),
  ('payoutEnabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE td_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_used_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (allows full access for backend)
-- Note: The service_role key bypasses RLS, so these are mainly for documentation

-- Sessions: Full access via service role
CREATE POLICY "Service role full access to td_sessions" ON td_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Claims: Full access via service role
CREATE POLICY "Service role full access to td_claims" ON td_claims
  FOR ALL USING (true) WITH CHECK (true);

-- Settings: Full access via service role
CREATE POLICY "Service role full access to td_settings" ON td_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Used signatures: Full access via service role
CREATE POLICY "Service role full access to td_used_signatures" ON td_used_signatures
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- DONE! Your database is ready.
-- Tables created: td_sessions, td_claims, td_settings, td_used_signatures
-- =============================================
