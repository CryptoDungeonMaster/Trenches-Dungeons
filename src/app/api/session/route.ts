import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID, randomBytes } from "crypto";
import { createSession, getSessionByEntrySig, isSignatureUsed } from "@/lib/db-supabase";
import { createSessionToken } from "@/lib/jwt";

// Request schema
const createSessionSchema = z.object({
  playerPubkey: z.string().min(32).max(44),
  signature: z.string().min(80).max(100),
});

/**
 * POST /api/session
 * Creates a new game session after payment verification
 *
 * This endpoint should only be called after /api/verify-entry succeeds.
 * We double-check that the signature was marked as used (by verify-entry).
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = createSessionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { playerPubkey, signature } = parseResult.data;

    // Verify that this signature was verified and marked as used
    const wasUsed = await isSignatureUsed(signature);

    if (!wasUsed) {
      return NextResponse.json(
        { error: "Payment not verified. Please verify payment first." },
        { status: 400 }
      );
    }

    // Check if a session already exists for this signature
    const existingSession = await getSessionByEntrySig(signature);

    if (existingSession) {
      // Return the existing session if it's still active
      if (existingSession.status === "active" && new Date(existingSession.expires_at) > new Date()) {
        const token = await createSessionToken(
          existingSession.id,
          playerPubkey,
          existingSession.seed,
          30
        );

        return NextResponse.json({
          sessionId: existingSession.id,
          token,
          seed: existingSession.seed,
          expiresAt: new Date(existingSession.expires_at).getTime(),
          message: "Returning existing active session",
        });
      }

      return NextResponse.json(
        { error: "Session for this payment has already been used" },
        { status: 400 }
      );
    }

    // Generate new session
    const sessionId = randomUUID();
    const seed = randomBytes(16).toString("hex"); // 32 char hex string
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    // Create session in database
    const session = await createSession({
      id: sessionId,
      player: playerPubkey,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      entry_sig: signature,
      status: "active",
      score: 0,
      seed: seed,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create session" },
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
      message: "Session created successfully. The gates open...",
    });
  } catch (error) {
    console.error("Error in create session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
