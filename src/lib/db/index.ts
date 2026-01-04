import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Use a file-based SQLite database
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "trenches.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent access
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Initialize tables
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      entry_sig TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      score INTEGER DEFAULT 0,
      seed TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      player TEXT NOT NULL,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      claim_sig TEXT,
      amount REAL NOT NULL,
      created_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS used_signatures (
      signature TEXT PRIMARY KEY,
      used_at INTEGER NOT NULL,
      player TEXT NOT NULL
    );

    -- Insert default settings if they don't exist
    INSERT OR IGNORE INTO settings (key, value) VALUES ('entryFee', '1000000');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('rewardAmount', '500000');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('treasuryPublicKey', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('difficulty', 'normal');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('payoutEnabled', 'false');
  `);
}

// Initialize on import
try {
  initializeDatabase();
} catch (error) {
  console.error("Failed to initialize database:", error);
}
