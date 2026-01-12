import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";
import { randomBytes } from "crypto";

interface ActionRequest {
  partyId: string;
  playerAddress: string;
  action: {
    type: "move" | "attack" | "defend" | "skill" | "item" | "flee" | "choice";
    target?: string;
    data?: Record<string, unknown>;
  };
}

// POST /api/party/game/action - Submit a player action
export async function POST(request: NextRequest) {
  try {
    const body: ActionRequest = await request.json();
    const { partyId, playerAddress, action } = body;

    if (!partyId || !playerAddress || !action) {
      return NextResponse.json(
        { error: "Party ID, player address, and action required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    // Get current game state
    const { data: gameState, error: fetchError } = await supabase
      .from(TABLES.partyGameState)
      .select("*")
      .eq("party_id", partyId)
      .single();

    if (fetchError || !gameState) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if game is active
    if (gameState.status !== "active") {
      return NextResponse.json({ error: "Game is not active" }, { status: 400 });
    }

    // Verify it's this player's turn (for combat)
    if (
      gameState.turn_phase === "combat" &&
      gameState.current_turn_player !== playerAddress
    ) {
      return NextResponse.json({ error: "Not your turn!" }, { status: 400 });
    }

    // Process the action
    const result = processAction(gameState, playerAddress, action);

    // Update game state
    const { error: updateError } = await supabase
      .from(TABLES.partyGameState)
      .update({
        ...result.updates,
        updated_at: new Date().toISOString(),
      })
      .eq("party_id", partyId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: result.message,
      nextTurn: result.updates.current_turn_player,
    });
  } catch (error) {
    console.error("Action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Process different action types
function processAction(
  gameState: Record<string, unknown>,
  playerAddress: string,
  action: ActionRequest["action"]
): { updates: Record<string, unknown>; message: string } {
  const playersState = gameState.players_state as Array<Record<string, unknown>>;
  const actionLog = (gameState.action_log as Array<Record<string, unknown>>) || [];
  const currentEncounter = gameState.current_encounter as Record<string, unknown> | null;
  const combatState = gameState.combat_state as Record<string, unknown> | null;

  // Find the acting player
  const playerIndex = playersState.findIndex((p) => p.address === playerAddress);
  if (playerIndex === -1) {
    return { updates: {}, message: "Player not found" };
  }

  const player = { ...playersState[playerIndex] };
  let message = "";
  const updates: Record<string, unknown> = {};

  switch (action.type) {
    case "choice": {
      // Handle dialogue/encounter choices
      const choiceId = action.data?.choiceId as string;
      message = `${player.name} chose: ${choiceId}`;

      if (choiceId === "enter" || choiceId === "continue") {
        // Generate next encounter
        const nextEncounter = generateEncounter(
          gameState.current_floor as number,
          gameState.current_room as number
        );
        
        updates.current_room = (gameState.current_room as number) + 1;
        updates.current_encounter = nextEncounter;
        updates.turn_phase = nextEncounter.type === "combat" ? "combat" : "dialogue";
        
        if (nextEncounter.type === "combat") {
          // Initialize combat
          updates.combat_state = initializeCombat(
            playersState, 
            (nextEncounter.enemies as Array<Record<string, unknown>>) || []
          );
        }
        
        message = `The party advances to room ${updates.current_room}...`;
      } else if (choiceId === "attack") {
        // Start combat if not already in it
        if (currentEncounter && (currentEncounter.type as string) === "combat") {
          updates.turn_phase = "combat";
          updates.combat_state = initializeCombat(
            playersState, 
            (currentEncounter.enemies as Array<Record<string, unknown>>) || []
          );
        }
      } else if (choiceId === "rest") {
        // Heal the party
        const healedPlayers = playersState.map((p) => ({
          ...p,
          health: Math.min((p.health as number) + 20, p.maxHealth as number),
        }));
        updates.players_state = healedPlayers;
        message = "The party rests and recovers 20 health each.";
      } else if (choiceId === "treasure") {
        // Give gold to all players
        const goldAmount = 50 + Math.floor(Math.random() * 50);
        const enrichedPlayers = playersState.map((p) => ({
          ...p,
          gold: (p.gold as number) + goldAmount,
          score: (p.score as number) + goldAmount,
        }));
        updates.players_state = enrichedPlayers;
        message = `The party found ${goldAmount} gold each!`;
      }
      break;
    }

    case "attack": {
      if (!combatState) {
        return { updates: {}, message: "Not in combat" };
      }

      const enemies = combatState.enemies as Array<Record<string, unknown>>;
      const targetIndex = enemies.findIndex((e) => e.id === action.target);
      
      if (targetIndex === -1) {
        return { updates: {}, message: "Invalid target" };
      }

      // Calculate damage (simple formula)
      const baseDamage = player.characterClass === "warrior" ? 15 : player.characterClass === "mage" ? 20 : 12;
      const damage = baseDamage + Math.floor(Math.random() * 10);
      
      const enemy = { ...enemies[targetIndex] };
      enemy.health = Math.max(0, (enemy.health as number) - damage);
      
      const updatedEnemies = [...enemies];
      updatedEnemies[targetIndex] = enemy;
      
      message = `${player.name} attacks ${enemy.name} for ${damage} damage!`;
      
      // Check if enemy defeated
      if (enemy.health === 0) {
        message += ` ${enemy.name} is defeated!`;
        player.score = (player.score as number) + 75;
        
        // Remove dead enemy
        updatedEnemies.splice(targetIndex, 1);
      }

      // Check if all enemies defeated
      if (updatedEnemies.length === 0) {
        message += " Combat victory!";
        updates.turn_phase = "loot";
        updates.combat_state = null;
        updates.current_encounter = {
          id: "loot",
          type: "loot",
          title: "Victory!",
          description: "You have defeated the enemies! Collect your rewards.",
          options: [
            { id: "continue", text: "🚪 Continue deeper" },
          ],
          rewards: { gold: 50, score: 100 },
        };
        
        // Give rewards
        const rewardedPlayers = playersState.map((p) => ({
          ...p,
          gold: (p.gold as number) + 50,
          score: (p.score as number) + 100,
        }));
        updates.players_state = rewardedPlayers;
      } else {
        updates.combat_state = {
          ...combatState,
          enemies: updatedEnemies,
        };
        
        // Update player in state
        const updatedPlayersState = [...playersState];
        updatedPlayersState[playerIndex] = player;
        updates.players_state = updatedPlayersState;
        
        // Move to next turn
        const nextTurn = getNextTurn(combatState, playerAddress, playersState);
        updates.current_turn_player = nextTurn.player;
        
        // If it's an enemy's turn, process enemy attack
        if (nextTurn.isEnemy) {
          const enemyResult = processEnemyTurn(updatedPlayersState, updatedEnemies);
          updates.players_state = enemyResult.playersState;
          message += ` ${enemyResult.message}`;
          updates.current_turn_player = enemyResult.nextPlayer;
          
          // Check for defeat
          const allDead = enemyResult.playersState.every((p) => !p.isAlive);
          if (allDead) {
            updates.status = "defeat";
            message += " The party has been defeated!";
          }
        }
      }
      break;
    }

    case "defend": {
      // Add temporary defense buff
      player.isDefending = true;
      const updatedPlayersState = [...playersState];
      updatedPlayersState[playerIndex] = player;
      updates.players_state = updatedPlayersState;
      message = `${player.name} takes a defensive stance!`;
      
      // Move to next turn
      if (combatState) {
        const nextTurn = getNextTurn(combatState, playerAddress, playersState);
        updates.current_turn_player = nextTurn.player;
      }
      break;
    }

    case "flee": {
      // Attempt to flee (50% chance)
      const success = Math.random() > 0.5;
      if (success) {
        message = "The party successfully flees!";
        updates.combat_state = null;
        updates.turn_phase = "exploration";
        updates.current_encounter = {
          id: "fled",
          type: "dialogue",
          title: "Escaped!",
          description: "You managed to escape the danger... for now.",
          options: [{ id: "continue", text: "🚪 Continue carefully" }],
        };
      } else {
        message = `${player.name} tried to flee but failed!`;
        if (combatState) {
          const nextTurn = getNextTurn(combatState, playerAddress, playersState);
          updates.current_turn_player = nextTurn.player;
        }
      }
      break;
    }

    default:
      message = `${player.name} performed an action.`;
  }

  // Add to action log
  const newAction = {
    id: randomBytes(8).toString("hex"),
    player: playerAddress,
    action: action.type,
    result: message,
    timestamp: Date.now(),
  };

  updates.action_log = [newAction, ...actionLog.slice(0, 19)]; // Keep last 20

  return { updates, message };
}

// Generate a random encounter
function generateEncounter(floor: number, room: number): Record<string, unknown> {
  const encounterTypes = ["combat", "treasure", "trap", "rest", "dialogue"];
  const weights = [0.4, 0.2, 0.15, 0.1, 0.15];
  
  // Boss every 5 rooms
  if (room > 0 && room % 5 === 0) {
    return {
      id: `boss-${floor}-${room}`,
      type: "combat",
      title: "Boss Chamber!",
      description: "A powerful enemy blocks your path!",
      enemies: [
        {
          id: "boss-1",
          name: floor === 1 ? "Goblin Chief" : "Dark Knight",
          health: 80 + floor * 20,
          maxHealth: 80 + floor * 20,
          damage: 15 + floor * 5,
          defense: 5,
          icon: "👹",
        },
      ],
      options: [
        { id: "attack", text: "⚔️ Fight!" },
        { id: "flee", text: "🏃 Try to flee" },
      ],
    };
  }

  // Random encounter
  const rand = Math.random();
  let cumulative = 0;
  let type = "combat";
  
  for (let i = 0; i < encounterTypes.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      type = encounterTypes[i];
      break;
    }
  }

  const encounters: Record<string, Record<string, unknown>> = {
    combat: {
      id: `combat-${floor}-${room}`,
      type: "combat",
      title: "Enemies Approach!",
      description: "Monsters block your path. Prepare for battle!",
      enemies: generateEnemies(floor),
      options: [
        { id: "attack", text: "⚔️ Attack!" },
        { id: "flee", text: "🏃 Try to flee" },
      ],
    },
    treasure: {
      id: `treasure-${floor}-${room}`,
      type: "treasure",
      title: "Treasure Found!",
      description: "A chest glimmers in the darkness...",
      options: [
        { id: "treasure", text: "💰 Open the chest" },
        { id: "continue", text: "🚪 Leave it (trap?)" },
      ],
    },
    trap: {
      id: `trap-${floor}-${room}`,
      type: "dialogue",
      title: "Trap!",
      description: "The floor gives way! Everyone takes 10 damage.",
      options: [{ id: "continue", text: "🚪 Continue carefully" }],
    },
    rest: {
      id: `rest-${floor}-${room}`,
      type: "dialogue",
      title: "Safe Room",
      description: "A peaceful chamber. You can rest here.",
      options: [
        { id: "rest", text: "💤 Rest and heal" },
        { id: "continue", text: "🚪 Keep moving" },
      ],
    },
    dialogue: {
      id: `dialogue-${floor}-${room}`,
      type: "dialogue",
      title: "Crossroads",
      description: "Two paths lie before you...",
      options: [
        { id: "continue", text: "🚪 Take the left path" },
        { id: "continue", text: "🚪 Take the right path" },
      ],
    },
  };

  return encounters[type];
}

function generateEnemies(floor: number): Array<Record<string, unknown>> {
  const enemyTypes = [
    { name: "Goblin", health: 30, damage: 8, icon: "👺" },
    { name: "Skeleton", health: 25, damage: 10, icon: "💀" },
    { name: "Rat Swarm", health: 20, damage: 6, icon: "🐀" },
    { name: "Orc", health: 50, damage: 12, icon: "👹" },
  ];

  const numEnemies = Math.min(1 + Math.floor(floor / 2), 3);
  const enemies: Array<Record<string, unknown>> = [];

  for (let i = 0; i < numEnemies; i++) {
    const template = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({
      id: `enemy-${i}`,
      name: template.name,
      health: template.health + floor * 5,
      maxHealth: template.health + floor * 5,
      damage: template.damage + floor * 2,
      defense: 2 + floor,
      icon: template.icon,
    });
  }

  return enemies;
}

function initializeCombat(
  players: Array<Record<string, unknown>>,
  enemies: Array<Record<string, unknown>>
): Record<string, unknown> {
  // Create turn order: all players, then all enemies
  const turnOrder = [
    ...players.filter((p) => p.isAlive).map((p) => p.address as string),
    ...enemies.map((e) => e.id as string),
  ];

  return {
    enemies,
    turnOrder,
    currentTurnIndex: 0,
    roundNumber: 1,
  };
}

function getNextTurn(
  combatState: Record<string, unknown>,
  currentPlayer: string,
  players: Array<Record<string, unknown>>
): { player: string; isEnemy: boolean } {
  const turnOrder = combatState.turnOrder as string[];
  const currentIndex = turnOrder.indexOf(currentPlayer);
  const nextIndex = (currentIndex + 1) % turnOrder.length;
  const nextId = turnOrder[nextIndex];

  // Check if it's an enemy
  const isEnemy = nextId.startsWith("enemy-");

  if (isEnemy) {
    // Find next living player for after enemy turns
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length > 0) {
      return { player: alivePlayers[0].address as string, isEnemy: true };
    }
  }

  return { player: nextId, isEnemy: false };
}

function processEnemyTurn(
  playersState: Array<Record<string, unknown>>,
  enemies: Array<Record<string, unknown>>
): {
  playersState: Array<Record<string, unknown>>;
  message: string;
  nextPlayer: string;
} {
  const messages: string[] = [];
  let updatedPlayers = [...playersState];

  for (const enemy of enemies) {
    // Find a random alive player to attack
    const alivePlayers = updatedPlayers.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) break;

    const targetIndex = Math.floor(Math.random() * alivePlayers.length);
    const target = { ...alivePlayers[targetIndex] };
    const targetPlayerIndex = updatedPlayers.findIndex(
      (p) => p.address === target.address
    );

    // Calculate damage
    let damage = enemy.damage as number;
    if (target.isDefending) {
      damage = Math.floor(damage / 2);
      target.isDefending = false;
    }

    target.health = Math.max(0, (target.health as number) - damage);
    if (target.health === 0) {
      target.isAlive = false;
      messages.push(`${enemy.name} defeats ${target.name}!`);
    } else {
      messages.push(`${enemy.name} attacks ${target.name} for ${damage} damage!`);
    }

    updatedPlayers[targetPlayerIndex] = target;
  }

  // Find first alive player for next turn
  const nextAlivePlayer = updatedPlayers.find((p) => p.isAlive);
  const nextPlayer = nextAlivePlayer
    ? (nextAlivePlayer.address as string)
    : (updatedPlayers[0].address as string);

  return {
    playersState: updatedPlayers,
    message: messages.join(" "),
    nextPlayer,
  };
}
