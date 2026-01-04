import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGameSettings, updateGameSettings } from "@/lib/settings";
import { getMintDecimals, toDisplayAmount } from "@/lib/solana";
import { isAdmin } from "@/lib/admins";

// Update schema
const updateSettingsSchema = z.object({
  entryFee: z.number().positive().optional(),
  rewardAmount: z.number().positive().optional(),
  treasuryPublicKey: z.string().min(32).max(44).optional(),
  difficulty: z.enum(["easy", "normal", "hard"]).optional(),
  payoutEnabled: z.boolean().optional(),
});

/**
 * GET /api/settings
 * Get current game settings (public, no auth needed)
 */
export async function GET() {
  try {
    const settings = await getGameSettings();
    const decimals = await getMintDecimals().catch(() => 6);

    return NextResponse.json({
      entryFee: toDisplayAmount(settings.entryFee, decimals),
      entryFeeRaw: settings.entryFee.toString(),
      rewardAmount: toDisplayAmount(settings.rewardAmount, decimals),
      rewardAmountRaw: settings.rewardAmount.toString(),
      treasuryPublicKey: settings.treasuryPublicKey,
      difficulty: settings.difficulty,
      payoutEnabled: settings.payoutEnabled,
      decimals,
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Update game settings (admin only)
 *
 * Requires X-Admin-Wallet header matching ADMIN_WALLET env var
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminWallet = request.headers.get("x-admin-wallet");

    if (!adminWallet || !isAdmin(adminWallet)) {
      return NextResponse.json(
        { error: "Unauthorized - not an admin wallet" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const parseResult = updateSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const updates = parseResult.data;
    const decimals = await getMintDecimals().catch(() => 6);

    // Convert display amounts to base units
    const settingsToUpdate: Parameters<typeof updateGameSettings>[0] = {};

    if (updates.entryFee !== undefined) {
      settingsToUpdate.entryFee = BigInt(Math.floor(updates.entryFee * Math.pow(10, decimals)));
    }
    if (updates.rewardAmount !== undefined) {
      settingsToUpdate.rewardAmount = BigInt(Math.floor(updates.rewardAmount * Math.pow(10, decimals)));
    }
    if (updates.treasuryPublicKey !== undefined) {
      settingsToUpdate.treasuryPublicKey = updates.treasuryPublicKey;
    }
    if (updates.difficulty !== undefined) {
      settingsToUpdate.difficulty = updates.difficulty;
    }
    if (updates.payoutEnabled !== undefined) {
      settingsToUpdate.payoutEnabled = updates.payoutEnabled;
    }

    await updateGameSettings(settingsToUpdate);

    // Return updated settings
    const newSettings = await getGameSettings();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        entryFee: toDisplayAmount(newSettings.entryFee, decimals),
        rewardAmount: toDisplayAmount(newSettings.rewardAmount, decimals),
        treasuryPublicKey: newSettings.treasuryPublicKey,
        difficulty: newSettings.difficulty,
        payoutEnabled: newSettings.payoutEnabled,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
