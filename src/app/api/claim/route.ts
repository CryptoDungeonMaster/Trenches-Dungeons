import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getSession, updateSession, createClaim } from "@/lib/db-supabase";
import { verifySessionToken } from "@/lib/jwt";
import { getGameSettings } from "@/lib/settings";

// Request schema
const claimSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * POST /api/claim
 * Claims reward for a completed session
 *
 * For MVP:
 * - If payoutEnabled is false, records claim as pending (manual distribution)
 * - If payoutEnabled is true (dev only), would send tokens from treasury
 *
 * SECURITY: Treasury payout with private key is for DEV/TEST only.
 * In production, use multisig or a separate payout service.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifySessionToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const parseResult = claimSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { sessionId } = parseResult.data;

    // Verify session ID matches JWT
    if (sessionId !== payload.sessionId) {
      return NextResponse.json(
        { error: "Session ID mismatch" },
        { status: 403 }
      );
    }

    // Get session from database
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify player matches
    if (session.player !== payload.player) {
      return NextResponse.json(
        { error: "Player mismatch" },
        { status: 403 }
      );
    }

    // Check session status - must be completed (not active or already claimed)
    if (session.status === "active") {
      return NextResponse.json(
        { error: "Session is still active. Complete the game first." },
        { status: 400 }
      );
    }

    if (session.status === "claimed") {
      return NextResponse.json(
        { error: "Reward has already been claimed for this session" },
        { status: 400 }
      );
    }

    if (session.status === "expired") {
      return NextResponse.json(
        { error: "Session has expired" },
        { status: 400 }
      );
    }

    // Get game settings
    const settings = await getGameSettings();

    // Calculate reward based on score (simple formula for MVP)
    const baseReward = Number(settings.rewardAmount);
    const scoreMultiplier = Math.min(2, 1 + (session.score || 0) / 10000);
    const rewardAmount = Math.floor(baseReward * scoreMultiplier);

    // Create claim record
    const claimId = randomUUID();

    const claim = await createClaim({
      id: claimId,
      player: session.player,
      session_id: sessionId,
      claim_sig: null, // Would contain tx signature if auto-payout
      amount: rewardAmount,
      status: "pending", // Would be "paid" after successful transfer
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Failed to create claim" },
        { status: 500 }
      );
    }

    // Mark session as claimed
    await updateSession(sessionId, { status: "claimed" });

    return NextResponse.json({
      success: true,
      message: "Reward claim recorded! Your reward will be distributed in the next payout batch.",
      claimId,
      amount: rewardAmount,
      score: session.score,
      status: "pending",
    });
  } catch (error) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
