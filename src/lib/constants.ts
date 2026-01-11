/**
 * Application Constants
 * Central location for configuration values
 */

// ============================================
// SOLANA & TOKEN
// ============================================

/**
 * TND Token Mint Address on Solana Mainnet
 * This is the actual Pump.fun SPL token
 */
export const TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_MINT || "CkTFDNGUtw58dBDEnMD9RW3tjTVKaoVXctcXdq8Gpump";

/**
 * Treasury wallet that receives entry fees
 */
export const TREASURY_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA";

/**
 * RPC endpoint for Solana connections
 * Using Helius for reliability
 */
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";

// ============================================
// GAME SETTINGS DEFAULTS
// ============================================

/**
 * Default entry fee in base token units (with decimals)
 * 100 TND with 6 decimals = 100_000_000
 */
export const DEFAULT_ENTRY_FEE = 100_000_000;

/**
 * Default reward amount in base token units
 * 50 TND with 6 decimals = 50_000_000
 */
export const DEFAULT_REWARD_AMOUNT = 50_000_000;

/**
 * Token decimals (standard SPL token)
 */
export const TOKEN_DECIMALS = 6;

// ============================================
// GAME MECHANICS
// ============================================

/**
 * Maximum dungeon floors
 */
export const MAX_FLOORS = 3;

/**
 * Score multipliers
 */
export const SCORE_MULTIPLIERS = {
  ENEMY_KILL: 100,
  BOSS_KILL: 500,
  GOLD_COLLECTED: 1, // per gold
  FLOOR_CLEARED: 200,
  PERFECT_CLEAR: 300, // no damage taken on floor
  SPEED_BONUS: 50, // per minute under par
};

/**
 * Difficulty modifiers
 */
export const DIFFICULTY = {
  normal: { damageMultiplier: 1.0, healthMultiplier: 1.0, rewardMultiplier: 1.0 },
  hard: { damageMultiplier: 1.25, healthMultiplier: 1.5, rewardMultiplier: 1.5 },
  nightmare: { damageMultiplier: 1.5, healthMultiplier: 2.0, rewardMultiplier: 2.0 },
};

// ============================================
// UI & UX
// ============================================

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  DICE_ROLL: 1500,
  ENCOUNTER_TRANSITION: 400,
  COMBAT_ACTION: 300,
  MODAL_OPEN: 200,
};

/**
 * Leaderboard settings
 */
export const LEADERBOARD = {
  PAGE_SIZE: 50,
  MAX_ENTRIES_SHOWN: 100,
  REFRESH_INTERVAL: 60000, // 1 minute
};

// ============================================
// API & SESSION
// ============================================

/**
 * Session duration in seconds (2 hours)
 */
export const SESSION_DURATION = 2 * 60 * 60;

/**
 * JWT expiration in seconds (matches session)
 */
export const JWT_EXPIRATION = SESSION_DURATION;

/**
 * API rate limits
 */
export const RATE_LIMITS = {
  VERIFY_ENTRY: { requests: 5, window: 60 }, // 5 per minute
  CLAIM_REWARD: { requests: 3, window: 60 }, // 3 per minute
  LEADERBOARD: { requests: 30, window: 60 }, // 30 per minute
};
