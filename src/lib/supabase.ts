import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create clients only if credentials are available (prevents build errors)
function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured");
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

function createSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase admin credentials not configured");
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Client for frontend (uses anon key, respects RLS)
export const supabase = createSupabaseClient();

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createSupabaseAdminClient();

// Types for our tables
export interface Session {
  id: string;
  player: string;
  started_at: string;
  expires_at: string;
  entry_sig: string;
  status: "active" | "completed" | "expired" | "claimed";
  score: number;
  seed: string;
  created_at?: string;
}

export interface Claim {
  id: string;
  player: string;
  session_id: string;
  claim_sig: string | null;
  amount: number;
  status: "pending" | "paid" | "failed";
  created_at?: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface UsedSignature {
  signature: string;
  used_at: string;
  player: string;
}
