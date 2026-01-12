-- ============================================
-- TRENCHES & DRAGONS - Database Schema
-- All tables prefixed with 'td_' to avoid conflicts
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- CORE GAME TABLES
-- ============================================

-- Sessions table (existing, updated)
CREATE TABLE IF NOT EXISTS td_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  entry_sig TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'claimed')),
  score INTEGER DEFAULT 0,
  seed TEXT NOT NULL,
  character_class TEXT DEFAULT 'warrior',
  character_name TEXT DEFAULT 'Hero',
  floor_reached INTEGER DEFAULT 1,
  enemies_defeated INTEGER DEFAULT 0,
  gold_collected INTEGER DEFAULT 0,
  play_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims table (existing)
CREATE TABLE IF NOT EXISTS td_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES td_sessions(id),
  claim_sig TEXT UNIQUE,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (existing)
CREATE TABLE IF NOT EXISTS td_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Used signatures table (existing)
CREATE TABLE IF NOT EXISTS td_used_signatures (
  signature TEXT PRIMARY KEY,
  player TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADERBOARD TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS td_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_address TEXT NOT NULL,
  player_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  floors_cleared INTEGER NOT NULL DEFAULT 0,
  enemies_defeated INTEGER NOT NULL DEFAULT 0,
  gold_collected INTEGER NOT NULL DEFAULT 0,
  play_time_seconds INTEGER NOT NULL DEFAULT 0,
  character_class TEXT NOT NULL DEFAULT 'warrior',
  session_id UUID REFERENCES td_sessions(id),
  season INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for quick lookups
  CONSTRAINT unique_session_entry UNIQUE (session_id)
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_td_leaderboard_score ON td_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_td_leaderboard_season ON td_leaderboard(season, score DESC);
CREATE INDEX IF NOT EXISTS idx_td_leaderboard_player ON td_leaderboard(player_address);
CREATE INDEX IF NOT EXISTS idx_td_leaderboard_class ON td_leaderboard(character_class, score DESC);

-- ============================================
-- ITEM DEFINITIONS TABLE (Static data)
-- ============================================

CREATE TABLE IF NOT EXISTS td_item_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'armor', 'helmet', 'boots', 'accessory', 'consumable')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  icon TEXT NOT NULL DEFAULT '📦',
  
  -- Stats bonuses (for equipment)
  stat_health INTEGER DEFAULT 0,
  stat_max_health INTEGER DEFAULT 0,
  stat_damage INTEGER DEFAULT 0,
  stat_defense INTEGER DEFAULT 0,
  stat_speed INTEGER DEFAULT 0,
  stat_crit_chance DECIMAL(4,2) DEFAULT 0,
  
  -- Consumable effects
  effect_type TEXT, -- 'heal', 'mana', 'buff', 'damage'
  effect_value INTEGER DEFAULT 0,
  effect_duration INTEGER DEFAULT 0,
  
  -- Requirements
  required_level INTEGER DEFAULT 1,
  required_class TEXT, -- NULL means any class
  
  -- Shop info
  buy_price INTEGER DEFAULT 0,
  sell_price INTEGER DEFAULT 0,
  
  -- Stacking
  stackable BOOLEAN DEFAULT FALSE,
  max_stack INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLAYER INVENTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS td_player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_address TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES td_item_definitions(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped_slot TEXT, -- NULL if not equipped, or 'weapon', 'armor', etc.
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure player can't have duplicate equipped items in same slot
  CONSTRAINT unique_equipped_slot UNIQUE (player_address, equipped_slot)
);

CREATE INDEX IF NOT EXISTS idx_td_inventory_player ON td_player_inventory(player_address);
CREATE INDEX IF NOT EXISTS idx_td_inventory_equipped ON td_player_inventory(player_address, equipped_slot) WHERE equipped_slot IS NOT NULL;

-- ============================================
-- PLAYER CHARACTERS TABLE (Persistent progression)
-- ============================================

CREATE TABLE IF NOT EXISTS td_player_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_address TEXT NOT NULL,
  character_name TEXT NOT NULL,
  character_class TEXT NOT NULL CHECK (character_class IN ('warrior', 'mage', 'rogue')),
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  
  -- Current stats (base + equipment bonuses calculated on read)
  base_health INTEGER NOT NULL DEFAULT 100,
  base_max_health INTEGER NOT NULL DEFAULT 100,
  base_mana INTEGER NOT NULL DEFAULT 50,
  base_max_mana INTEGER NOT NULL DEFAULT 50,
  base_damage INTEGER NOT NULL DEFAULT 10,
  base_defense INTEGER NOT NULL DEFAULT 5,
  base_speed INTEGER NOT NULL DEFAULT 5,
  
  -- Lifetime stats
  total_kills INTEGER DEFAULT 0,
  total_gold_earned INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  highest_floor INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_player_character UNIQUE (player_address, character_name)
);

CREATE INDEX IF NOT EXISTS idx_td_characters_player ON td_player_characters(player_address);

-- ============================================
-- CO-OP PARTY TABLES
-- ============================================

-- Parties table
CREATE TABLE IF NOT EXISTS td_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- 6 character join code
  leader_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_dungeon', 'completed', 'disbanded')),
  max_size INTEGER NOT NULL DEFAULT 4,
  
  -- Party settings
  loot_distribution TEXT DEFAULT 'ffa' CHECK (loot_distribution IN ('ffa', 'round_robin', 'need_greed')),
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('normal', 'hard', 'nightmare')),
  allow_mid_join BOOLEAN DEFAULT FALSE,
  
  -- Dungeon state (when in_dungeon)
  current_floor INTEGER DEFAULT 0,
  current_room INTEGER DEFAULT 0,
  dungeon_seed TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_td_parties_code ON td_parties(code);
CREATE INDEX IF NOT EXISTS idx_td_parties_status ON td_parties(status);

-- Party members table
CREATE TABLE IF NOT EXISTS td_party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES td_parties(id) ON DELETE CASCADE,
  player_address TEXT NOT NULL,
  character_id UUID REFERENCES td_player_characters(id),
  
  is_ready BOOLEAN DEFAULT FALSE,
  is_leader BOOLEAN DEFAULT FALSE,
  
  -- In-dungeon state
  current_health INTEGER,
  current_mana INTEGER,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_party_member UNIQUE (party_id, player_address)
);

CREATE INDEX IF NOT EXISTS idx_td_party_members_party ON td_party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_td_party_members_player ON td_party_members(player_address);

-- ============================================
-- MULTIPLAYER GAME STATE (Real-time sync)
-- ============================================

CREATE TABLE IF NOT EXISTS td_party_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES td_parties(id) ON DELETE CASCADE,
  
  -- Dungeon progress
  current_floor INTEGER NOT NULL DEFAULT 1,
  current_room INTEGER NOT NULL DEFAULT 0,
  dungeon_seed TEXT NOT NULL,
  
  -- Turn management
  current_turn_player TEXT, -- wallet address of whose turn it is
  turn_number INTEGER NOT NULL DEFAULT 1,
  turn_phase TEXT NOT NULL DEFAULT 'exploration' CHECK (turn_phase IN ('exploration', 'combat', 'dialogue', 'loot', 'waiting')),
  
  -- Players state (JSON array)
  -- [{address, name, class, health, maxHealth, mana, maxMana, gold, items, position}]
  players_state JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Current encounter (JSON)
  -- {type, enemies[], dialogue, options[], rewards}
  current_encounter JSONB,
  
  -- Combat state (JSON)
  -- {enemies[], turnOrder[], currentCombatTurn, roundNumber}
  combat_state JSONB,
  
  -- Action log (last 20 actions for replay/display)
  -- [{player, action, result, timestamp}]
  action_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Game status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'victory', 'defeat', 'abandoned')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_party_game UNIQUE (party_id)
);

CREATE INDEX IF NOT EXISTS idx_td_party_game_party ON td_party_game_state(party_id);
CREATE INDEX IF NOT EXISTS idx_td_party_game_status ON td_party_game_state(status);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE td_party_game_state;

-- ============================================
-- LOOT DROP LOG (for tracking/analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS td_loot_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES td_sessions(id),
  player_address TEXT NOT NULL,
  item_id TEXT REFERENCES td_item_definitions(id),
  gold_amount INTEGER DEFAULT 0,
  floor_number INTEGER NOT NULL,
  enemy_killed TEXT,
  dropped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_td_loot_drops_session ON td_loot_drops(session_id);
CREATE INDEX IF NOT EXISTS idx_td_loot_drops_player ON td_loot_drops(player_address);

-- ============================================
-- DEFAULT SETTINGS
-- ============================================

INSERT INTO td_settings (key, value) VALUES 
  ('entry_fee', '100000000'),
  ('reward_amount', '50000000'),
  ('treasury_public_key', '4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA'),
  ('difficulty', 'normal'),
  ('current_season', '1')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DEFAULT ITEM DEFINITIONS
-- ============================================

INSERT INTO td_item_definitions (id, name, description, item_type, rarity, icon, stat_damage, required_level, buy_price, sell_price) VALUES
  -- WEAPONS
  ('rusty_sword', 'Rusty Sword', 'A worn blade, still sharp enough.', 'weapon', 'common', '🗡️', 3, 1, 50, 25),
  ('iron_sword', 'Iron Sword', 'A reliable soldier''s weapon.', 'weapon', 'common', '⚔️', 5, 1, 100, 50),
  ('steel_blade', 'Steel Blade', 'Forged in the fires of war.', 'weapon', 'uncommon', '🔪', 8, 3, 250, 125),
  ('blood_reaver', 'Blood Reaver', 'It thirsts for battle.', 'weapon', 'rare', '🩸', 12, 5, 500, 250),
  ('shadow_fang', 'Shadow Fang', 'Strikes from the darkness.', 'weapon', 'rare', '🌙', 10, 5, 450, 225),
  ('inferno_blade', 'Inferno Blade', 'Burns with eternal flame.', 'weapon', 'epic', '🔥', 18, 8, 1000, 500),
  ('frostbite', 'Frostbite', 'Chills to the bone.', 'weapon', 'epic', '❄️', 16, 8, 950, 475),
  ('trench_lords_bane', 'Trench Lord''s Bane', 'The legendary slayer.', 'weapon', 'legendary', '👑', 25, 10, 2500, 1250)
ON CONFLICT (id) DO NOTHING;

INSERT INTO td_item_definitions (id, name, description, item_type, rarity, icon, stat_defense, stat_max_health, required_level, buy_price, sell_price) VALUES
  -- ARMOR
  ('leather_vest', 'Leather Vest', 'Basic protection.', 'armor', 'common', '🥋', 2, 10, 1, 75, 35),
  ('chain_mail', 'Chain Mail', 'Interlocking rings of steel.', 'armor', 'uncommon', '⛓️', 5, 20, 3, 300, 150),
  ('plate_armor', 'Plate Armor', 'Heavy but protective.', 'armor', 'rare', '🛡️', 10, 40, 6, 750, 375),
  ('shadow_cloak', 'Shadow Cloak', 'Blend with darkness.', 'armor', 'epic', '🌑', 8, 30, 8, 1100, 550),
  ('dragonscale_mail', 'Dragonscale Mail', 'Scales of an ancient wyrm.', 'armor', 'legendary', '🐉', 15, 60, 10, 3000, 1500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO td_item_definitions (id, name, description, item_type, rarity, icon, effect_type, effect_value, stackable, max_stack, buy_price, sell_price) VALUES
  -- CONSUMABLES
  ('health_potion', 'Health Potion', 'Restores 30 health.', 'consumable', 'common', '🧪', 'heal', 30, TRUE, 10, 25, 12),
  ('greater_health_potion', 'Greater Health Potion', 'Restores 60 health.', 'consumable', 'uncommon', '🧴', 'heal', 60, TRUE, 10, 75, 35),
  ('mana_potion', 'Mana Potion', 'Restores 25 mana.', 'consumable', 'common', '💎', 'mana', 25, TRUE, 10, 30, 15),
  ('elixir_of_might', 'Elixir of Might', 'Temporarily boosts damage.', 'consumable', 'rare', '💪', 'buff', 5, TRUE, 5, 150, 75),
  ('antidote', 'Antidote', 'Cures poison.', 'consumable', 'common', '🌿', 'heal', 10, TRUE, 10, 20, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO td_item_definitions (id, name, description, item_type, rarity, icon, stat_speed, stat_defense, required_level, buy_price, sell_price) VALUES
  -- ACCESSORIES
  ('lucky_charm', 'Lucky Charm', 'Fortune favors you.', 'accessory', 'uncommon', '🍀', 2, 0, 2, 200, 100),
  ('ring_of_protection', 'Ring of Protection', 'A magical ward.', 'accessory', 'rare', '💍', 0, 5, 5, 400, 200),
  ('amulet_of_speed', 'Amulet of Speed', 'Move like the wind.', 'accessory', 'rare', '⚡', 5, 0, 5, 450, 225),
  ('trench_talisman', 'Trench Talisman', 'Survivor''s luck.', 'accessory', 'epic', '🔮', 3, 3, 8, 800, 400)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DISABLE RLS FOR THESE TABLES
-- (or configure proper policies)
-- ============================================

ALTER TABLE td_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_used_signatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_leaderboard DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_item_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_player_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_player_characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_parties DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_party_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE td_loot_drops DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON td_sessions TO authenticated, anon, service_role;
GRANT ALL ON td_claims TO authenticated, anon, service_role;
GRANT ALL ON td_settings TO authenticated, anon, service_role;
GRANT ALL ON td_used_signatures TO authenticated, anon, service_role;
GRANT ALL ON td_leaderboard TO authenticated, anon, service_role;
GRANT ALL ON td_item_definitions TO authenticated, anon, service_role;
GRANT ALL ON td_player_inventory TO authenticated, anon, service_role;
GRANT ALL ON td_player_characters TO authenticated, anon, service_role;
GRANT ALL ON td_parties TO authenticated, anon, service_role;
GRANT ALL ON td_party_members TO authenticated, anon, service_role;
GRANT ALL ON td_loot_drops TO authenticated, anon, service_role;

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Top 100 leaderboard view
CREATE OR REPLACE VIEW td_leaderboard_top100 AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
  player_address,
  player_name,
  score,
  floors_cleared,
  enemies_defeated,
  gold_collected,
  character_class,
  created_at
FROM td_leaderboard
WHERE season = (SELECT CAST(value AS INTEGER) FROM td_settings WHERE key = 'current_season')
ORDER BY score DESC
LIMIT 100;

-- Player stats summary view
CREATE OR REPLACE VIEW td_player_stats AS
SELECT 
  player_address,
  COUNT(*) as total_runs,
  MAX(score) as best_score,
  SUM(gold_collected) as total_gold,
  SUM(enemies_defeated) as total_kills,
  MAX(floors_cleared) as best_floor,
  AVG(score) as avg_score
FROM td_leaderboard
GROUP BY player_address;
