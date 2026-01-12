import { supabaseAdmin, Session, Claim, Setting } from "./supabase";
import { TABLES } from "./db-tables";

// Helper to check if Supabase is configured
function getSupabase() {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured. Please set environment variables.");
  }
  return supabaseAdmin;
}

/**
 * Initialize database tables in Supabase
 * Run this once to create the tables
 */
export async function initializeDatabase() {
  const db = getSupabase();
  
  // Tables should be created via Supabase dashboard or migrations
  // This function ensures default settings exist
  const defaultSettings = [
    { key: "entryFee", value: "1000000" },
    { key: "rewardAmount", value: "500000" },
    { key: "treasuryPublicKey", value: "CjSqsat78oKYhoSwSkdkQFoXyyBqjhBBqJTwFnvB8K9S" },
    { key: "difficulty", value: "normal" },
    { key: "payoutEnabled", value: "false" },
  ];

  for (const setting of defaultSettings) {
    await db
      .from(TABLES.settings)
      .upsert(setting, { onConflict: "key", ignoreDuplicates: true });
  }
}

// ============================================
// SESSIONS
// ============================================

export async function createSession(session: Omit<Session, "created_at">): Promise<Session | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.sessions)
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return null;
  }
  return data;
}

export async function getSession(id: string): Promise<Session | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.sessions)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data;
}

export async function getSessionByEntrySig(entrySig: string): Promise<Session | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.sessions)
    .select("*")
    .eq("entry_sig", entrySig)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error getting session by entry sig:", error);
  }
  return data || null;
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<boolean> {
  const db = getSupabase();
  const { error } = await db
    .from(TABLES.sessions)
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating session:", error);
    return false;
  }
  return true;
}

// ============================================
// CLAIMS
// ============================================

export async function createClaim(claim: Omit<Claim, "created_at">): Promise<Claim | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.claims)
    .insert(claim)
    .select()
    .single();

  if (error) {
    console.error("Error creating claim:", error);
    return null;
  }
  return data;
}

export async function getClaimsByPlayer(player: string): Promise<Claim[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.claims)
    .select("*")
    .eq("player", player)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting claims:", error);
    return [];
  }
  return data || [];
}

// ============================================
// SETTINGS
// ============================================

export async function getSetting(key: string): Promise<string | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.settings)
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error("Error getting setting:", error);
    return null;
  }
  return data?.value || null;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const db = getSupabase();
  const { error } = await db
    .from(TABLES.settings)
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    console.error("Error setting value:", error);
    return false;
  }
  return true;
}

export async function getAllSettings(): Promise<Map<string, string>> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.settings)
    .select("*");

  if (error) {
    console.error("Error getting all settings:", error);
    return new Map();
  }

  return new Map((data || []).map((s: Setting) => [s.key, s.value]));
}

// ============================================
// USED SIGNATURES (Anti-replay)
// ============================================

export async function isSignatureUsed(signature: string): Promise<boolean> {
  const db = getSupabase();
  const { data, error } = await db
    .from(TABLES.usedSignatures)
    .select("signature")
    .eq("signature", signature)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking signature:", error);
  }
  return !!data;
}

export async function markSignatureUsed(signature: string, player: string): Promise<boolean> {
  const db = getSupabase();
  const { error } = await db
    .from(TABLES.usedSignatures)
    .insert({
      signature,
      player,
      used_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error marking signature used:", error);
    return false;
  }
  return true;
}
