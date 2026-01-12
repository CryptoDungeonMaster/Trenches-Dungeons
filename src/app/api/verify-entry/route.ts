import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyTokenTransfer } from "@/lib/solana";
import { getGameSettings } from "@/lib/settings";
import { isSignatureUsed, markSignatureUsed, createSession } from "@/lib/db-supabase";
import { createSessionToken } from "@/lib/jwt";

// Rate limiting: simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Request schema
const verifyEntrySchema = z.object({
  signature: z.string().min(80).max(100), // Solana signatures are ~88 chars
  playerPubkey: z.string().min(32).max(44), // Base58 pubkeys
});

/**
 * POST /api/verify-entry
 * Verifies that a player has paid the entry fee
 *
 * CRITICAL SECURITY CHECKS:
 * 1. Rate limiting to prevent spam
 * 2. Signature hasn't been used before (replay protection)
 * 3. Transaction is confirmed/finalized on-chain
 * 4. Transfer is for the correct SPL token mint
 * 5. Sender matches the player's pubkey
 * 6. Recipient is the treasury wallet
 * 7. Amount >= entry fee
 * 8. Transaction is recent (within last N minutes)
 */
export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait and try again." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = verifyEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { signature, playerPubkey } = parseResult.data;

    // Get game settings
    const settings = await getGameSettings();

    if (!settings.treasuryPublicKey) {
      return NextResponse.json(
        { error: "Treasury not configured. Contact admin." },
        { status: 503 }
      );
    }

    // SECURITY CHECK 1: Check if signature has already been used
    const alreadyUsed = await isSignatureUsed(signature);

    if (alreadyUsed) {
      return NextResponse.json(
        { error: "This transaction has already been used for entry" },
        { status: 400 }
      );
    }

    // SECURITY CHECK 2-8: Verify the on-chain transfer
    const verificationResult = await verifyTokenTransfer(
      signature,
      playerPubkey,
      settings.treasuryPublicKey,
      settings.entryFee,
      10 // Transaction must be within last 10 minutes
    );

    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.error || "Transfer verification failed" },
        { status: 400 }
      );
    }

    // Mark signature as used (prevent replay)
    await markSignatureUsed(signature, playerPubkey);

    // Create game session
    const seed = Math.floor(Math.random() * 1000000);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const session = await createSession({
      id: crypto.randomUUID(),
      player: playerPubkey,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      entry_sig: signature,
      status: "active",
      score: 0,
      seed: seed.toString(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create game session" },
        { status: 500 }
      );
    }

    // Create JWT token for the session
    const token = await createSessionToken(
      session.id,
      playerPubkey,
      seed.toString(),
      120 // 2 hours
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      token,
      sessionId: session.id,
      seed,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in verify-entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
