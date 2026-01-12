import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";
import { randomBytes } from "crypto";

// Generate a 6-character party code
function generatePartyCode(): string {
  return randomBytes(3)
    .toString("hex")
    .toUpperCase()
    .slice(0, 6);
}

// GET /api/party - Get party info by code or ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const id = searchParams.get("id");
    const playerAddress = searchParams.get("player");

    if (!code && !id && !playerAddress) {
      return NextResponse.json(
        { error: "Party code, ID, or player address required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    // If looking up by player, find their active party
    if (playerAddress && !code && !id) {
      const { data: memberData, error: memberError } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id")
        .eq("player_address", playerAddress)
        .single();

      if (memberError || !memberData) {
        return NextResponse.json({ party: null, message: "Not in a party" });
      }

      const { data: party, error: partyError } = await supabase
        .from(TABLES.parties)
        .select("*")
        .eq("id", memberData.party_id)
        .single();

      if (partyError || !party) {
        return NextResponse.json({ error: "Party not found" }, { status: 404 });
      }

      // Get members
      const { data: members } = await supabase
        .from(TABLES.partyMembers)
        .select("*")
        .eq("party_id", party.id);

      return NextResponse.json({ party: { ...party, members } });
    }

    // Build query based on code or id
    let query = supabase.from(TABLES.parties).select("*");
    
    if (code) {
      query = query.eq("code", code.toUpperCase());
    } else if (id) {
      query = query.eq("id", id);
    }

    const { data: party, error } = await query.single();

    if (error || !party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    // Get members
    const { data: members } = await supabase
      .from(TABLES.partyMembers)
      .select("*")
      .eq("party_id", party.id);

    return NextResponse.json({ party: { ...party, members } });
  } catch (error: unknown) {
    console.error("Get party error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/party - Create or join a party
const actionSchema = z.object({
  action: z.enum(["create", "join"]),
  leader: z.string().min(32).max(44).optional(),
  player: z.string().min(32).max(44).optional(),
  code: z.string().min(4).max(6).optional(),
  force: z.boolean().optional(), // Force cleanup of any existing party memberships
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = actionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { action, leader, player, code: partyCode, force } = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // If force flag is set, clean up ALL party memberships for this player first
    if (force) {
      const playerAddress = leader || player;
      if (playerAddress) {
        await supabase
          .from(TABLES.partyMembers)
          .delete()
          .eq("player_address", playerAddress);
      }
    }

    // JOIN action
    if (action === "join") {
      if (!partyCode || !player) {
        return NextResponse.json({ error: "Code and player required for join" }, { status: 400 });
      }

      // Find party by code
      const { data: party, error: findError } = await supabase
        .from(TABLES.parties)
        .select("*")
        .eq("code", partyCode.toUpperCase())
        .eq("status", "waiting")
        .single();

      if (findError || !party) {
        return NextResponse.json({ error: "Party not found or already started" }, { status: 404 });
      }

      // Check if already in this party
      const { data: existingMember } = await supabase
        .from(TABLES.partyMembers)
        .select("*")
        .eq("party_id", party.id)
        .eq("player_address", player)
        .single();

      if (existingMember) {
        // Already in party, just return info
        const { data: members } = await supabase
          .from(TABLES.partyMembers)
          .select("player_address, is_ready")
          .eq("party_id", party.id);

        return NextResponse.json({
          partyId: party.id,
          code: party.code,
          members: members?.map(m => ({ address: m.player_address, ready: m.is_ready })) || [],
        });
      }

      // Check if player is in a different party and clean up if stale
      const { data: playerInOtherParty } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id")
        .eq("player_address", player)
        .neq("party_id", party.id)
        .single();
      
      if (playerInOtherParty) {
        // Check if that party is still active
        const { data: otherParty } = await supabase
          .from(TABLES.parties)
          .select("id, status")
          .eq("id", playerInOtherParty.party_id)
          .single();
        
        if (!otherParty || otherParty.status === "completed" || otherParty.status === "disbanded") {
          // Clean up stale membership
          await supabase
            .from(TABLES.partyMembers)
            .delete()
            .eq("player_address", player)
            .eq("party_id", playerInOtherParty.party_id);
        } else {
          return NextResponse.json({ error: "Already in another party. Leave current party first." }, { status: 400 });
        }
      }

      // Check party size
      const { count } = await supabase
        .from(TABLES.partyMembers)
        .select("*", { count: "exact", head: true })
        .eq("party_id", party.id);

      if ((count || 0) >= party.max_size) {
        return NextResponse.json({ error: "Party is full" }, { status: 400 });
      }

      // Add member
      await supabase.from(TABLES.partyMembers).insert({
        party_id: party.id,
        player_address: player,
        is_leader: false,
        is_ready: true,
      });

      // Get all members
      const { data: members } = await supabase
        .from(TABLES.partyMembers)
        .select("player_address, is_ready")
        .eq("party_id", party.id);

      return NextResponse.json({
        partyId: party.id,
        code: party.code,
        members: members?.map(m => ({ address: m.player_address, ready: m.is_ready })) || [],
      });
    }

    // CREATE action
    if (!leader) {
      return NextResponse.json({ error: "Leader required for create" }, { status: 400 });
    }

    const data = { leaderAddress: leader };

    // Check if player is already in a party
    const { data: existingMember } = await supabase
      .from(TABLES.partyMembers)
      .select("party_id")
      .eq("player_address", data.leaderAddress)
      .single();

    if (existingMember) {
      // Check if that party is still active and recent
      const { data: existingParty } = await supabase
        .from(TABLES.parties)
        .select("id, status, created_at")
        .eq("id", existingMember.party_id)
        .single();
      
      // Clean up if: party doesn't exist, is completed/disbanded, or is stale (waiting for >2 hours)
      const isStale = existingParty?.created_at && 
        (Date.now() - new Date(existingParty.created_at).getTime() > 2 * 60 * 60 * 1000);
      
      if (!existingParty || existingParty.status === "completed" || existingParty.status === "disbanded" || 
          (existingParty.status === "waiting" && isStale)) {
        // Clean up ALL memberships for this player
        await supabase
          .from(TABLES.partyMembers)
          .delete()
          .eq("player_address", data.leaderAddress);
      } else {
        // Party is still active, don't allow creating new one
        return NextResponse.json(
          { error: "Already in a party. Leave current party first." },
          { status: 400 }
        );
      }
    }

    // Generate unique party code
    let code = generatePartyCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from(TABLES.parties)
        .select("id")
        .eq("code", code)
        .single();
      
      if (!existing) break;
      code = generatePartyCode();
      attempts++;
    }

    // Create party
    const { data: party, error: partyError } = await supabase
      .from(TABLES.parties)
      .insert({
        code,
        leader_address: data.leaderAddress,
        max_size: 4,
        loot_distribution: "ffa",
        difficulty: "normal",
      })
      .select()
      .single();

    if (partyError || !party) {
      console.error("Create party error:", partyError);
      return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
    }

    // Add leader as first member
    const { error: memberError } = await supabase.from(TABLES.partyMembers).insert({
      party_id: party.id,
      player_address: data.leaderAddress,
      is_leader: true,
      is_ready: true,
    });

    if (memberError) {
      // Clean up party if member creation fails
      await supabase.from(TABLES.parties).delete().eq("id", party.id);
      return NextResponse.json({ error: "Failed to add leader to party" }, { status: 500 });
    }

    return NextResponse.json({
      partyId: party.id,
      code: party.code,
      members: [{ address: data.leaderAddress, ready: true }],
      message: "Party created",
    });
  } catch (error: unknown) {
    console.error("Create party error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/party - Join party, update settings, or change ready status
const updatePartySchema = z.object({
  action: z.enum(["join", "leave", "ready", "settings", "start", "kick"]),
  playerAddress: z.string().min(32).max(44),
  partyCode: z.string().length(6).optional(),
  partyId: z.string().uuid().optional(),
  isReady: z.boolean().optional(),
  targetPlayer: z.string().optional(), // for kick
  settings: z
    .object({
      lootDistribution: z.enum(["ffa", "round_robin", "need_greed"]).optional(),
      difficulty: z.enum(["normal", "hard", "nightmare"]).optional(),
      allowMidJoin: z.boolean().optional(),
    })
    .optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = updatePartySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // Handle join action
    if (data.action === "join") {
      if (!data.partyCode) {
        return NextResponse.json({ error: "Party code required" }, { status: 400 });
      }

      // Check if already in a party
      const { data: existingMember } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id")
        .eq("player_address", data.playerAddress)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: "Already in a party" }, { status: 400 });
      }

      // Get party
      const { data: party, error: partyError } = await supabase
        .from(TABLES.parties)
        .select("*")
        .eq("code", data.partyCode.toUpperCase())
        .single();

      if (partyError || !party) {
        return NextResponse.json({ error: "Party not found" }, { status: 404 });
      }

      if (party.status !== "lobby") {
        if (!party.allow_mid_join) {
          return NextResponse.json({ error: "Party is not accepting new members" }, { status: 400 });
        }
      }

      // Count current members
      const { count } = await supabase
        .from(TABLES.partyMembers)
        .select("*", { count: "exact", head: true })
        .eq("party_id", party.id);

      if ((count || 0) >= party.max_size) {
        return NextResponse.json({ error: "Party is full" }, { status: 400 });
      }

      // Add member
      const { error: joinError } = await supabase.from(TABLES.partyMembers).insert({
        party_id: party.id,
        player_address: data.playerAddress,
        is_leader: false,
        is_ready: false,
      });

      if (joinError) {
        return NextResponse.json({ error: "Failed to join party" }, { status: 500 });
      }

      return NextResponse.json({ message: "Joined party", partyId: party.id });
    }

    // Handle leave action
    if (data.action === "leave") {
      // Get member info
      const { data: member, error: memberError } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id, is_leader")
        .eq("player_address", data.playerAddress)
        .single();

      if (memberError || !member) {
        return NextResponse.json({ error: "Not in a party" }, { status: 400 });
      }

      // Remove member
      await supabase
        .from(TABLES.partyMembers)
        .delete()
        .eq("player_address", data.playerAddress);

      // If leader left, either promote someone or disband
      if (member.is_leader) {
        const { data: remainingMembers } = await supabase
          .from(TABLES.partyMembers)
          .select("id")
          .eq("party_id", member.party_id)
          .limit(1);

        if (!remainingMembers || remainingMembers.length === 0) {
          // Disband party
          await supabase
            .from(TABLES.parties)
            .update({ status: "disbanded" })
            .eq("id", member.party_id);
        } else {
          // Promote first remaining member
          await supabase
            .from(TABLES.partyMembers)
            .update({ is_leader: true })
            .eq("id", remainingMembers[0].id);
        }
      }

      return NextResponse.json({ message: "Left party" });
    }

    // Handle ready action
    if (data.action === "ready") {
      const { error } = await supabase
        .from(TABLES.partyMembers)
        .update({ is_ready: data.isReady ?? true })
        .eq("player_address", data.playerAddress);

      if (error) {
        return NextResponse.json({ error: "Failed to update ready status" }, { status: 500 });
      }

      return NextResponse.json({ message: "Ready status updated" });
    }

    // Handle settings action (leader only)
    if (data.action === "settings" && data.settings) {
      // Verify leader
      const { data: member } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id, is_leader")
        .eq("player_address", data.playerAddress)
        .single();

      if (!member?.is_leader) {
        return NextResponse.json({ error: "Only leader can change settings" }, { status: 403 });
      }

      const { error } = await supabase
        .from(TABLES.parties)
        .update({
          loot_distribution: data.settings.lootDistribution,
          difficulty: data.settings.difficulty,
          allow_mid_join: data.settings.allowMidJoin,
        })
        .eq("id", member.party_id);

      if (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
      }

      return NextResponse.json({ message: "Settings updated" });
    }

    // Handle start action (leader only)
    if (data.action === "start") {
      const { data: member } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id, is_leader")
        .eq("player_address", data.playerAddress)
        .single();

      if (!member?.is_leader) {
        return NextResponse.json({ error: "Only leader can start" }, { status: 403 });
      }

      // Check all members ready
      const { data: notReady } = await supabase
        .from(TABLES.partyMembers)
        .select("id")
        .eq("party_id", member.party_id)
        .eq("is_ready", false);

      if (notReady && notReady.length > 0) {
        return NextResponse.json({ error: "Not all members are ready" }, { status: 400 });
      }

      // Generate dungeon seed
      const seed = randomBytes(16).toString("hex");

      const { error } = await supabase
        .from(TABLES.parties)
        .update({
          status: "in_dungeon",
          dungeon_seed: seed,
          current_floor: 1,
          current_room: 0,
        })
        .eq("id", member.party_id);

      if (error) {
        return NextResponse.json({ error: "Failed to start dungeon" }, { status: 500 });
      }

      return NextResponse.json({ message: "Dungeon started", seed });
    }

    // Handle kick action (leader only)
    if (data.action === "kick" && data.targetPlayer) {
      const { data: member } = await supabase
        .from(TABLES.partyMembers)
        .select("party_id, is_leader")
        .eq("player_address", data.playerAddress)
        .single();

      if (!member?.is_leader) {
        return NextResponse.json({ error: "Only leader can kick" }, { status: 403 });
      }

      // Cannot kick yourself
      if (data.targetPlayer === data.playerAddress) {
        return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
      }

      const { error } = await supabase
        .from(TABLES.partyMembers)
        .delete()
        .eq("party_id", member.party_id)
        .eq("player_address", data.targetPlayer);

      if (error) {
        return NextResponse.json({ error: "Failed to kick player" }, { status: 500 });
      }

      return NextResponse.json({ message: "Player kicked" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Update party error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
