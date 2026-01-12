"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

// Types for multiplayer game state
export interface PlayerState {
  address: string;
  name: string;
  characterClass: "warrior" | "mage" | "rogue";
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  score: number;
  items: string[];
  isReady: boolean;
  isAlive: boolean;
}

export interface EnemyState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  icon: string;
}

export interface CombatState {
  enemies: EnemyState[];
  turnOrder: string[]; // player addresses or enemy ids
  currentTurnIndex: number;
  roundNumber: number;
}

export interface EncounterState {
  id: string;
  type: "combat" | "treasure" | "trap" | "rest" | "merchant" | "boss" | "dialogue";
  title: string;
  description: string;
  enemies?: EnemyState[];
  options?: Array<{
    id: string;
    text: string;
    requires?: { gold?: number; item?: string; class?: string };
  }>;
  rewards?: { gold?: number; items?: string[]; score?: number };
}

export interface ActionLogEntry {
  id: string;
  player: string;
  action: string;
  result: string;
  timestamp: number;
}

export interface MultiplayerGameState {
  id: string;
  partyId: string;
  currentFloor: number;
  currentRoom: number;
  dungeonSeed: string;
  currentTurnPlayer: string | null;
  turnNumber: number;
  turnPhase: "exploration" | "combat" | "dialogue" | "loot" | "waiting";
  playersState: PlayerState[];
  currentEncounter: EncounterState | null;
  combatState: CombatState | null;
  actionLog: ActionLogEntry[];
  status: "active" | "victory" | "defeat" | "abandoned";
  updatedAt: string;
}

interface UseMultiplayerGameOptions {
  partyId: string;
  playerAddress: string;
  onGameUpdate?: (state: MultiplayerGameState) => void;
  onPlayerAction?: (action: ActionLogEntry) => void;
}

// Create Supabase client for real-time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Retry configuration
const MAX_RETRIES = 15; // 15 retries * 2 seconds = 30 seconds max wait
const RETRY_DELAY = 2000; // 2 seconds between retries

export function useMultiplayerGame({
  partyId,
  playerAddress,
  onGameUpdate,
  onPlayerAction,
}: UseMultiplayerGameOptions) {
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingForGame, setIsWaitingForGame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient(supabaseUrl, supabaseAnonKey));
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial game state with retry logic for 404s
  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch(`/api/party/game?partyId=${partyId}`);
      
      if (res.status === 404) {
        // Game not found - might not be created yet (race condition)
        // Retry a few times before giving up
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          setIsWaitingForGame(true);
          setIsLoading(false);
          console.log(`[MP] Game not found, retrying (${retryCountRef.current}/${MAX_RETRIES})...`);
          
          retryTimeoutRef.current = setTimeout(() => {
            fetchGameState();
          }, RETRY_DELAY);
          return;
        }
        // Exhausted retries
        throw new Error("Game not found. The party leader may not have started the game yet.");
      }
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch game state");
      }
      
      const data = await res.json();
      retryCountRef.current = 0; // Reset retry count on success
      setIsWaitingForGame(false);
      setGameState(data.gameState);
      setIsMyTurn(data.gameState?.currentTurnPlayer === playerAddress);
      onGameUpdate?.(data.gameState);
    } catch (err) {
      setIsWaitingForGame(false);
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setIsLoading(false);
    }
  }, [partyId, playerAddress, onGameUpdate]);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = supabaseRef.current;

    // Subscribe to game state changes
    const channel = supabase
      .channel(`party-game-${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "td_party_game_state",
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          const newState = transformDbToState(payload.new);
          setGameState(newState);
          setIsMyTurn(newState.currentTurnPlayer === playerAddress);
          onGameUpdate?.(newState);

          // Check for new actions
          if (newState.actionLog.length > 0) {
            const latestAction = newState.actionLog[0];
            onPlayerAction?.(latestAction);
          }
        }
      )
      // Also subscribe to INSERT events so we catch game creation
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "td_party_game_state",
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          // Game was just created - load it
          console.log("[MP] Game created, loading state...");
          const newState = transformDbToState(payload.new);
          retryCountRef.current = 0;
          setIsWaitingForGame(false);
          setGameState(newState);
          setIsMyTurn(newState.currentTurnPlayer === playerAddress);
          onGameUpdate?.(newState);
          
          // Clear any pending retry
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Fetch initial state
    fetchGameState();

    // Cleanup
    return () => {
      channel.unsubscribe();
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [partyId, playerAddress, fetchGameState, onGameUpdate, onPlayerAction]);

  // Submit an action
  const submitAction = useCallback(
    async (action: {
      type: "move" | "attack" | "defend" | "skill" | "item" | "flee" | "choice";
      target?: string;
      data?: Record<string, unknown>;
    }) => {
      if (!isMyTurn && gameState?.turnPhase === "combat") {
        setError("Not your turn!");
        return false;
      }

      try {
        const res = await fetch("/api/party/game/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partyId,
            playerAddress,
            action,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Action failed");
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
        return false;
      }
    },
    [partyId, playerAddress, isMyTurn, gameState?.turnPhase]
  );

  // Helper functions
  const getMyPlayer = useCallback(() => {
    return gameState?.playersState.find((p) => p.address === playerAddress);
  }, [gameState, playerAddress]);

  const getCurrentTurnPlayer = useCallback(() => {
    return gameState?.playersState.find(
      (p) => p.address === gameState.currentTurnPlayer
    );
  }, [gameState]);

  return {
    gameState,
    isLoading,
    isWaitingForGame,
    error,
    isMyTurn,
    myPlayer: getMyPlayer(),
    currentTurnPlayer: getCurrentTurnPlayer(),
    submitAction,
    refetch: fetchGameState,
  };
}

// Transform database row to TypeScript interface
function transformDbToState(row: Record<string, unknown>): MultiplayerGameState {
  return {
    id: row.id as string,
    partyId: row.party_id as string,
    currentFloor: row.current_floor as number,
    currentRoom: row.current_room as number,
    dungeonSeed: row.dungeon_seed as string,
    currentTurnPlayer: row.current_turn_player as string | null,
    turnNumber: row.turn_number as number,
    turnPhase: row.turn_phase as MultiplayerGameState["turnPhase"],
    playersState: (row.players_state as PlayerState[]) || [],
    currentEncounter: row.current_encounter as EncounterState | null,
    combatState: row.combat_state as CombatState | null,
    actionLog: (row.action_log as ActionLogEntry[]) || [],
    status: row.status as MultiplayerGameState["status"],
    updatedAt: row.updated_at as string,
  };
}
