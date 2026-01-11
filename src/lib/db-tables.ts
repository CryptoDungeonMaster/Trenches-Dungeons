/**
 * Database table names with td_ prefix
 * Centralized to avoid typos and make refactoring easier
 */

export const TABLES = {
  sessions: "td_sessions",
  claims: "td_claims",
  settings: "td_settings",
  usedSignatures: "td_used_signatures",
  leaderboard: "td_leaderboard",
  itemDefinitions: "td_item_definitions",
  playerInventory: "td_player_inventory",
  playerCharacters: "td_player_characters",
  parties: "td_parties",
  partyMembers: "td_party_members",
  lootDrops: "td_loot_drops",
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];
