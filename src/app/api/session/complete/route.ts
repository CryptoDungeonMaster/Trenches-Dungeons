import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, updateSession } from "@/lib/db-supabase";
import { verifySessionToken } from "@/lib/jwt";

// Request schema
const completeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  score: z.number().int().min(0).max(1000000),
});

/**
 * POST /api/session/complete
 * Marks a session as completed and records the final score
 *
 * Requires valid JWT in Authorization header
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
    const parseResult = completeSessionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { sessionId, score } = parseResult.data;

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

    // Check session status
    if (session.status !== "active") {
      return NextResponse.json(
        { error: `Session is already ${session.status}` },
        { status: 400 }
      );
    }

    // Update session to completed
    const updated = await updateSession(sessionId, {
      status: "completed",
      score: score,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session completed successfully",
      score,
      sessionId,
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
