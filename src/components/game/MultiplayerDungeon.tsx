"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";
import { CLASSES } from "@/data/classes";
import { 
  useMultiplayerGame, 
  MultiplayerGameState, 
  PlayerState, 
  EnemyState,
  ActionLogEntry 
} from "@/hooks/useMultiplayerGame";

// ============================================
// TYPES
// ============================================
interface MultiplayerDungeonProps {
  partyId: string;
}

// ============================================
// EMBER PARTICLES
// ============================================
function EmberParticles() {
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    setEmbers(Array.from({ length: 12 }, (_, i) => ({ 
      id: i, 
      x: Math.random() * 100, 
      delay: Math.random() * 4, 
      size: 2 + Math.random() * 2 
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ x: `${e.x}%`, y: "100%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 4 + Math.random() * 2, delay: e.delay, repeat: Infinity }}
          className="absolute rounded-full"
          style={{ 
            width: e.size, 
            height: e.size, 
            background: "var(--ember)", 
            boxShadow: `0 0 ${e.size * 2}px var(--ember)` 
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// PARTY STATUS PANEL
// ============================================
function PartyStatusPanel({ 
  players, 
  currentTurnPlayer,
  myAddress,
  floor,
  room,
}: { 
  players: PlayerState[];
  currentTurnPlayer: string | null;
  myAddress: string;
  floor: number;
  room: number;
}) {
  return (
    <div className="fixed top-4 right-4 z-40 w-72">
      {/* Floor Info */}
      <div className="td-panel p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="td-label text-[10px]">Floor</p>
            <p className="font-display text-xl text-gold1">{floor}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className="td-label text-[10px]">Room</p>
            <p className="font-display text-xl text-text0">{room}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className="td-label text-[10px]">Party</p>
            <p className="font-display text-xl text-venom">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Party Members */}
      <div className="td-panel p-3 space-y-2">
        <p className="td-label text-[10px] mb-2">Party Members</p>
        {players.map((player) => {
          const classData = CLASSES[player.characterClass];
          const isMe = player.address === myAddress;
          const isCurrentTurn = player.address === currentTurnPlayer;
          const hpPercent = (player.health / player.maxHealth) * 100;
          
          return (
            <div
              key={player.address}
              className={cn(
                "p-2 rounded-lg transition-all",
                isCurrentTurn ? "bg-gold1/20 ring-1 ring-gold1" : "bg-bg1",
                !player.isAlive && "opacity-50"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{classData?.icon || "⚔️"}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-display text-sm truncate",
                    isMe ? "text-gold1" : "text-text0"
                  )}>
                    {player.name} {isMe && "(You)"}
                  </p>
                </div>
                {isCurrentTurn && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-xs"
                  >
                    ⚡
                  </motion.span>
                )}
              </div>
              
              {/* Health bar */}
              <div className="flex items-center gap-1">
                <span className="text-[10px]">❤️</span>
                <div className="flex-1 h-1.5 bg-bg2 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      hpPercent > 50 ? "bg-venom" : hpPercent > 25 ? "bg-ember" : "bg-blood"
                    )}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-text2 font-ui w-8 text-right">
                  {player.health}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 mt-1 text-[10px] text-text2">
                <span>💰 {player.gold}</span>
                <span>⭐ {player.score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ACTION LOG
// ============================================
function ActionLog({ actions }: { actions: ActionLogEntry[] }) {
  return (
    <div className="fixed bottom-4 left-4 z-40 w-80">
      <div className="td-panel p-3 max-h-48 overflow-y-auto">
        <p className="td-label text-[10px] mb-2">Battle Log</p>
        <div className="space-y-1">
          {actions.slice(0, 10).map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-ui text-text2"
            >
              <span className="text-text1">{action.result}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TURN INDICATOR
// ============================================
function TurnIndicator({ isMyTurn, currentPlayerName }: { isMyTurn: boolean; currentPlayerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-display",
        isMyTurn 
          ? "bg-gold1/20 border border-gold1 text-gold1" 
          : "bg-bg1 border border-line text-text1"
      )}
    >
      {isMyTurn ? (
        <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
          ⚡ YOUR TURN! ⚡
        </motion.span>
      ) : (
        <span>Waiting for {currentPlayerName}...</span>
      )}
    </motion.div>
  );
}

// ============================================
// ENCOUNTER DISPLAY
// ============================================
function EncounterDisplay({
  encounter,
  isMyTurn,
  onChoice,
  isLoading,
}: {
  encounter: MultiplayerGameState["currentEncounter"];
  isMyTurn: boolean;
  onChoice: (choiceId: string) => void;
  isLoading: boolean;
}) {
  if (!encounter) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl"
    >
      <div className="td-panel-elevated td-rivets overflow-hidden">
        {/* Header */}
        <div className="bg-arcane/10 border-b border-arcane/20 p-4 text-center">
          <h2 className="font-display text-2xl text-gold1">{encounter.title}</h2>
        </div>

        {/* Description */}
        <div className="p-5">
          <p className="text-text1 font-flavor italic text-center mb-6">
            {encounter.description}
          </p>

          {/* Options */}
          {encounter.options && encounter.options.length > 0 && (
            <div className="space-y-2">
              {encounter.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={isMyTurn ? { scale: 1.02 } : {}}
                  whileTap={isMyTurn ? { scale: 0.98 } : {}}
                  onClick={() => isMyTurn && onChoice(option.id)}
                  disabled={!isMyTurn || isLoading}
                  className={cn(
                    "w-full p-4 rounded-lg text-left transition-all",
                    "border border-line bg-bg1",
                    isMyTurn 
                      ? "hover:border-gold1/50 hover:bg-gold1/5 cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-text0 font-ui">{option.text}</span>
                </motion.button>
              ))}
            </div>
          )}

          {!isMyTurn && (
            <p className="text-center text-text2 text-sm font-ui mt-4">
              Waiting for party leader to choose...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// COMBAT DISPLAY
// ============================================
function CombatDisplay({
  enemies,
  players,
  myAddress,
  isMyTurn,
  onAttack,
  onDefend,
  onFlee,
  isLoading,
}: {
  enemies: EnemyState[];
  players: PlayerState[];
  myAddress: string;
  isMyTurn: boolean;
  onAttack: (targetId: string) => void;
  onDefend: () => void;
  onFlee: () => void;
  isLoading: boolean;
}) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(
    enemies.length > 0 ? enemies[0].id : null
  );

  const myPlayer = players.find((p) => p.address === myAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="td-panel-elevated td-rivets overflow-hidden">
        {/* Header */}
        <div className="bg-blood/10 border-b border-blood/20 p-3 text-center">
          <h2 className="font-display text-xl text-blood">⚔️ COMBAT ⚔️</h2>
        </div>

        <div className="p-5">
          {/* Enemies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {enemies.map((enemy) => {
              const hpPercent = (enemy.health / enemy.maxHealth) * 100;
              const isSelected = selectedTarget === enemy.id;
              
              return (
                <motion.button
                  key={enemy.id}
                  onClick={() => setSelectedTarget(enemy.id)}
                  className={cn(
                    "td-panel p-4 text-left transition-all",
                    isSelected && "ring-2 ring-blood"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl"
                    >
                      {enemy.icon}
                    </motion.span>
                    <div className="flex-1">
                      <p className="font-display text-text0">{enemy.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-bg2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blood transition-all"
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-text2">
                          {enemy.health}/{enemy.maxHealth}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Your stats */}
          {myPlayer && (
            <div className="td-panel p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text2 font-ui">Your HP</span>
                <span className="font-display text-gold1">
                  {myPlayer.health}/{myPlayer.maxHealth}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {isMyTurn ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => selectedTarget && onAttack(selectedTarget)}
                  disabled={!selectedTarget || isLoading}
                  className="td-btn td-btn-danger py-3"
                >
                  ⚔️ Attack
                </button>
                <button
                  onClick={onDefend}
                  disabled={isLoading}
                  className="td-btn td-btn-secondary py-3"
                >
                  🛡️ Defend
                </button>
              </div>
              <button
                onClick={onFlee}
                disabled={isLoading}
                className="w-full text-text2 hover:text-text1 text-sm font-ui py-2"
              >
                🏃 Try to Flee
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-text2 font-ui">Waiting for your turn...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// LOADING SCREEN
// ============================================
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg0">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-5xl mb-4"
        >
          ⚔️
        </motion.div>
        <p className="text-text2 font-ui">{message}</p>
      </div>
    </div>
  );
}

// ============================================
// GAME OVER SCREEN
// ============================================
function GameOverScreen({ 
  isVictory, 
  players, 
  myAddress,
  onExit 
}: { 
  isVictory: boolean;
  players: PlayerState[];
  myAddress: string;
  onExit: () => void;
}) {
  const myPlayer = players.find((p) => p.address === myAddress);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center bg-bg0 p-4"
    >
      <div className="td-panel-elevated p-8 max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-7xl mb-4"
        >
          {isVictory ? "🏆" : "💀"}
        </motion.div>
        
        <h1 className={cn(
          "font-display text-4xl mb-2",
          isVictory ? "text-gold1" : "text-blood"
        )}>
          {isVictory ? "VICTORY!" : "DEFEAT"}
        </h1>
        
        <p className="text-text2 font-flavor italic mb-6">
          {isVictory 
            ? "Your party has conquered the dungeon!" 
            : "The dungeon claims another party..."}
        </p>

        {/* Party Results */}
        <div className="space-y-2 mb-6">
          {players.map((player) => (
            <div 
              key={player.address}
              className={cn(
                "td-panel p-3 flex items-center justify-between",
                player.address === myAddress && "ring-1 ring-gold1"
              )}
            >
              <span className="text-text0 font-ui">{player.name}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gold1">💰 {player.gold}</span>
                <span className="text-arcane">⭐ {player.score}</span>
              </div>
            </div>
          ))}
        </div>

        {myPlayer && (
          <div className="td-panel p-4 mb-6">
            <p className="td-label text-xs mb-2">Your Total Score</p>
            <p className="font-display text-3xl text-gold1">{myPlayer.score}</p>
          </div>
        )}

        <button onClick={onExit} className="td-btn td-btn-primary w-full">
          Return to Home
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN MULTIPLAYER DUNGEON
// ============================================
export default function MultiplayerDungeon({ partyId }: MultiplayerDungeonProps) {
  const router = useRouter();
  const { publicKey } = useWallet();
  const playerAddress = publicKey?.toBase58() || "";
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    gameState,
    isLoading,
    error,
    isMyTurn,
    myPlayer,
    currentTurnPlayer,
    submitAction,
  } = useMultiplayerGame({
    partyId,
    playerAddress,
    onGameUpdate: (state) => {
      console.log("[MP] Game updated:", state.turnPhase, state.currentTurnPlayer);
    },
    onPlayerAction: (action) => {
      console.log("[MP] Action:", action.result);
    },
  });

  // Handle choice selection
  const handleChoice = useCallback(async (choiceId: string) => {
    setIsSubmitting(true);
    await submitAction({
      type: "choice",
      data: { choiceId },
    });
    setIsSubmitting(false);
  }, [submitAction]);

  // Handle combat attack
  const handleAttack = useCallback(async (targetId: string) => {
    setIsSubmitting(true);
    await submitAction({
      type: "attack",
      target: targetId,
    });
    setIsSubmitting(false);
  }, [submitAction]);

  // Handle defend
  const handleDefend = useCallback(async () => {
    setIsSubmitting(true);
    await submitAction({ type: "defend" });
    setIsSubmitting(false);
  }, [submitAction]);

  // Handle flee
  const handleFlee = useCallback(async () => {
    setIsSubmitting(true);
    await submitAction({ type: "flee" });
    setIsSubmitting(false);
  }, [submitAction]);

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Connecting to party..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg0 p-4">
        <div className="td-panel p-8 max-w-md text-center">
          <p className="text-blood text-xl mb-4">⚠️ {error}</p>
          <button onClick={() => router.push("/")} className="td-btn td-btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // No game state
  if (!gameState) {
    return <LoadingScreen message="Waiting for game to start..." />;
  }

  // Game over
  if (gameState.status === "victory" || gameState.status === "defeat") {
    return (
      <GameOverScreen
        isVictory={gameState.status === "victory"}
        players={gameState.playersState}
        myAddress={playerAddress}
        onExit={() => router.push("/")}
      />
    );
  }

  // Main game UI
  return (
    <div className="min-h-screen bg-bg0 relative">
      <div className="fixed inset-0 bg-radial-void pointer-events-none" />
      <EmberParticles />

      {/* Turn indicator */}
      <TurnIndicator 
        isMyTurn={isMyTurn} 
        currentPlayerName={currentTurnPlayer?.name || "..."} 
      />

      {/* Party status panel */}
      <PartyStatusPanel
        players={gameState.playersState}
        currentTurnPlayer={gameState.currentTurnPlayer}
        myAddress={playerAddress}
        floor={gameState.currentFloor}
        room={gameState.currentRoom}
      />

      {/* Action log */}
      <ActionLog actions={gameState.actionLog} />

      {/* Main game content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pr-80 pl-4">
        <AnimatePresence mode="wait">
          {/* Exploration/Dialogue phase */}
          {(gameState.turnPhase === "exploration" || 
            gameState.turnPhase === "dialogue" || 
            gameState.turnPhase === "loot" ||
            gameState.turnPhase === "waiting") && (
            <EncounterDisplay
              key="encounter"
              encounter={gameState.currentEncounter}
              isMyTurn={isMyTurn}
              onChoice={handleChoice}
              isLoading={isSubmitting}
            />
          )}

          {/* Combat phase */}
          {gameState.turnPhase === "combat" && gameState.combatState && (
            <CombatDisplay
              key="combat"
              enemies={gameState.combatState.enemies}
              players={gameState.playersState}
              myAddress={playerAddress}
              isMyTurn={isMyTurn}
              onAttack={handleAttack}
              onDefend={handleDefend}
              onFlee={handleFlee}
              isLoading={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
