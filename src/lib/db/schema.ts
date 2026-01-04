import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Sessions table - tracks game sessions
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // UUID
  player: text("player").notNull(), // Wallet public key
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  entrySig: text("entry_sig").notNull().unique(), // Prevents replay attacks
  status: text("status", { enum: ["active", "completed", "expired", "claimed"] }).notNull().default("active"),
  score: integer("score").default(0),
  seed: text("seed").notNull(), // Server-generated seed for deterministic RNG
});

// Claims table - tracks reward claims
export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(), // UUID
  player: text("player").notNull(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  claimSig: text("claim_sig"), // Transaction signature if payout was made
  amount: real("amount").notNull(), // Reward amount
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["pending", "paid", "failed"] }).notNull().default("pending"),
});

// Settings table - key-value store for game configuration
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Used signatures table - prevents replay attacks
export const usedSignatures = sqliteTable("used_signatures", {
  signature: text("signature").primaryKey(),
  usedAt: integer("used_at", { mode: "timestamp" }).notNull(),
  player: text("player").notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Setting = typeof settings.$inferSelect;
