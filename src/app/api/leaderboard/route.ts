import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

const TABLE = "td_leaderboard";

// GET /api/leaderboard - Fetch leaderboard entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const characterClass = searchParams.get("class");
    const playerAddress = searchParams.get("player");

    const supabase = createServiceRoleSupabaseClient();

    // Build query
    let query = supabase
      .from(TABLE)
      .select("*")
      .order("score", { ascending: false })
      .range(offset, offset + limit - 1);

    if (characterClass && ["warrior", "mage", "rogue"].includes(characterClass)) {
      query = query.eq("character_class", characterClass);
    }

    if (playerAddress) {
      query = query.eq("player_address", playerAddress);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    // Add rank numbers and transform column names for frontend
    const rankedData = (data || []).map((entry, index) => ({
      rank: offset + index + 1,
      player_pubkey: entry.player_address,
      score: entry.score,
      gold: entry.gold_collected,
      floors_cleared: entry.floors_cleared,
      kills: entry.enemies_defeated,
      class: entry.character_class,
      created_at: entry.created_at,
    }));

    return NextResponse.json({
      entries: rankedData,
      total: rankedData.length,
    });
  } catch (error: unknown) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/leaderboard - Submit a score
const submitScoreSchema = z.object({
  playerPubkey: z.string().min(32).max(44),
  score: z.number().int().min(0),
  gold: z.number().int().min(0),
  floorsCleared: z.number().int().min(0),
  kills: z.number().int().min(0),
  characterClass: z.enum(["warrior", "mage", "rogue"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = submitScoreSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // Get current season
    const { data: seasonSetting } = await supabase
      .from("td_settings")
      .select("value")
      .eq("key", "current_season")
      .single();

    const season = seasonSetting ? parseInt(seasonSetting.value, 10) : 1;

    // Insert new entry
    const { error: insertError } = await supabase.from(TABLE).insert({
      player_address: data.playerPubkey,
      score: data.score,
      gold_collected: data.gold,
      floors_cleared: data.floorsCleared,
      enemies_defeated: data.kills,
      character_class: data.characterClass,
      season,
    });

    if (insertError) {
      console.error("Leaderboard insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit score" }, { status: 500 });
    }

    // Get the rank of this score
    const { count } = await supabase
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .gt("score", data.score);

    const rank = (count || 0) + 1;

    return NextResponse.json({ 
      message: "Score submitted", 
      created: true,
      rank,
    });
  } catch (error: unknown) {
    console.error("Leaderboard submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
