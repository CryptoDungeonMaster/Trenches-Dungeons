import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID, randomBytes } from "crypto";
import { createSessionToken } from "@/lib/jwt";
import { hasFreeEntry } from "@/lib/admins";
import { supabaseAdmin } from "@/lib/supabase";

// Request schema
const freeEntrySchema = z.object({
  playerPubkey: z.string().min(32).max(44),
});

/**
 * POST /api/free-entry
 * Creates a free game session for admin wallets
 * No payment required - for testing and admin access
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = freeEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { playerPubkey } = parseResult.data;

    // Check if wallet has free entry privileges
    if (!hasFreeEntry(playerPubkey)) {
      return NextResponse.json(
        { error: "This wallet does not have free entry privileges" },
        { status: 403 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured. Please set Supabase environment variables." },
        { status: 503 }
      );
    }

    // Generate a unique "signature" for free entry (not a real tx sig)
    const freeEntrySig = `FREE_ENTRY_${randomUUID()}`;

    // Generate new session
    const sessionId = randomUUID();
    const seed = randomBytes(16).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    // Create session in database
    const { data: session, error: dbError } = await supabaseAdmin
      .from("td_sessions")
      .insert({
        id: sessionId,
        player: playerPubkey,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        entry_sig: freeEntrySig,
        status: "active",
        score: 0,
        seed: seed,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Failed to create session", 
          details: dbError.message,
          hint: dbError.hint || "Make sure the td_sessions table exists and RLS is disabled"
        },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create session - no data returned" },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = await createSessionToken(sessionId, playerPubkey, seed, 30);

    return NextResponse.json({
      sessionId,
      token,
      seed,
      expiresAt: expiresAt.getTime(),
      message: "🎖️ Admin access granted. The gates open...",
      freeEntry: true,
    });
  } catch (error) {
    console.error("Error in free-entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
