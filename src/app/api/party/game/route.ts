import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";
import { randomBytes } from "crypto";

// GET /api/party/game - Get game state for a party
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partyId = searchParams.get("partyId");

    console.log("[Game GET] Looking for game with partyId:", partyId);

    if (!partyId) {
      return NextResponse.json({ error: "Party ID required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: gameState, error } = await supabase
      .from(TABLES.partyGameState)
      .select("*")
      .eq("party_id", partyId)
      .single();

    console.log("[Game GET] Result:", { gameState: !!gameState, error: error?.message });

    if (error || !gameState) {
      // Also try to find any game state to help debug
      const { data: allGames } = await supabase
        .from(TABLES.partyGameState)
        .select("id, party_id")
        .limit(5);
      console.log("[Game GET] All games in DB:", allGames);
      
      return NextResponse.json({ error: "Game not found", debug: { partyId, allGames } }, { status: 404 });
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

    console.log("[Game POST] Creating game for party:", partyId);
    console.log("[Game POST] Players:", players);

    if (!partyId || !players || players.length === 0) {
      return NextResponse.json(
        { error: "Party ID and players required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    // Check if game already exists - if so, return it instead of error
    const { data: existing, error: existingError } = await supabase
      .from(TABLES.partyGameState)
      .select("*")
      .eq("party_id", partyId)
      .single();

    console.log("[Game POST] Existing check:", { found: !!existing, error: existingError?.message });

    if (existing) {
      // Game already exists, just return it
      console.log("[Game POST] Game already exists for party, returning existing");
      return NextResponse.json({ gameState: existing, message: "Game already exists" });
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
      console.error("[Game POST] Create game error:", error);
      return NextResponse.json({ error: `Failed to create game: ${error.message}` }, { status: 500 });
    }

    console.log("[Game POST] Game created successfully:", gameState?.id);

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
