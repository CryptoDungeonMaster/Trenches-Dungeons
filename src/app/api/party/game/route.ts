import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";
import { randomBytes } from "crypto";

// GET /api/party/game - Get game state for a party
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partyId = searchParams.get("partyId");

    if (!partyId) {
      return NextResponse.json({ error: "Party ID required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: gameState, error } = await supabase
      .from(TABLES.partyGameState)
      .select("*")
      .eq("party_id", partyId)
      .single();

    if (error || !gameState) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ gameState });
  } catch (error) {
    console.error("Get game state error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/party/game - Initialize a new multiplayer game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partyId, players } = body;

    if (!partyId || !players || players.length === 0) {
      return NextResponse.json(
        { error: "Party ID and players required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    // Check if game already exists
    const { data: existing } = await supabase
      .from(TABLES.partyGameState)
      .select("id")
      .eq("party_id", partyId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Game already exists for this party" },
        { status: 400 }
      );
    }

    // Generate dungeon seed
    const seed = randomBytes(16).toString("hex");

    // Initialize player states with class defaults
    const classDefaults: Record<string, { health: number; mana: number }> = {
      warrior: { health: 120, mana: 30 },
      mage: { health: 70, mana: 100 },
      rogue: { health: 90, mana: 50 },
    };

    const playersState = players.map((p: { address: string; name: string; characterClass: string }, index: number) => ({
      address: p.address,
      name: p.name || `Player ${index + 1}`,
      characterClass: p.characterClass || "warrior",
      health: classDefaults[p.characterClass || "warrior"].health,
      maxHealth: classDefaults[p.characterClass || "warrior"].health,
      mana: classDefaults[p.characterClass || "warrior"].mana,
      maxMana: classDefaults[p.characterClass || "warrior"].mana,
      gold: 0,
      score: 0,
      items: [],
      isReady: true,
      isAlive: true,
    }));

    // First player goes first
    const firstPlayer = playersState[0].address;

    // Create initial encounter (first room)
    const initialEncounter = {
      id: "intro",
      type: "dialogue",
      title: "The Dungeon Entrance",
      description: "Your party stands at the entrance of the ancient dungeon. Darkness awaits within, but so does treasure and glory. Work together to survive!",
      options: [
        { id: "enter", text: "🚪 Enter the dungeon together" },
        { id: "prepare", text: "🎒 Check equipment first" },
      ],
    };

    // Create game state
    const { data: gameState, error } = await supabase
      .from(TABLES.partyGameState)
      .insert({
        party_id: partyId,
        current_floor: 1,
        current_room: 0,
        dungeon_seed: seed,
        current_turn_player: firstPlayer,
        turn_number: 1,
        turn_phase: "dialogue",
        players_state: playersState,
        current_encounter: initialEncounter,
        combat_state: null,
        action_log: [{
          id: randomBytes(8).toString("hex"),
          player: "system",
          action: "game_start",
          result: "The party enters the dungeon!",
          timestamp: Date.now(),
        }],
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Create game error:", error);
      return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }

    // Update party status to in_dungeon
    await supabase
      .from(TABLES.parties)
      .update({ status: "in_dungeon" })
      .eq("id", partyId);

    return NextResponse.json({ gameState, message: "Game initialized" });
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
