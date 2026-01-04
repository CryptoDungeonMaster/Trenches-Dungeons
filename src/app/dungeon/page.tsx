"use client";

import { useState, useCallback, Suspense, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { generateId } from "@/lib/utils";

// ============================================
// TYPES
// ============================================
type EncounterType = "doors" | "combat" | "trap" | "treasure" | "rest";

interface LogEntry {
  id: string;
  text: string;
  type: "narrative" | "combat" | "loot" | "danger" | "success";
}

interface Enemy {
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  description: string;
  emoji: string;
}

// ============================================
// DATA
// ============================================
const ENEMIES: Enemy[] = [
  { name: "Trench Ghoul", health: 30, maxHealth: 30, damage: 8, description: "Born from mud and despair", emoji: "👹" },
  { name: "Shadow Stalker", health: 25, maxHealth: 25, damage: 12, description: "Strikes from the darkness", emoji: "👤" },
  { name: "War Revenant", health: 45, maxHealth: 45, damage: 15, description: "A fallen soldier's spirit", emoji: "💀" },
  { name: "Rat King", health: 20, maxHealth: 20, damage: 5, description: "A mass of vermin", emoji: "🐀" },
];

const DEMO_FLOW: EncounterType[] = ["doors", "combat", "doors", "treasure", "doors", "trap", "doors", "rest", "doors", "combat"];

// ============================================
// AMBIENT BACKGROUND
// ============================================
function DungeonAmbience() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-[#0d0d15] to-[#080810]" />
      <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-0 left-0 w-80 h-80 bg-orange-900/20 rounded-full blur-3xl" />
      <motion.div animate={{ opacity: [0.35, 0.55, 0.35] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute top-0 right-0 w-80 h-80 bg-orange-900/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}

// ============================================
// HUD
// ============================================
function HUD({ health, maxHealth, gold, score }: { health: number; maxHealth: number; gold: number; score: number }) {
  const healthPercent = (health / maxHealth) * 100;
  const healthColor = healthPercent > 60 ? "bg-red-600" : healthPercent > 30 ? "bg-orange-500" : "bg-red-800";

  return (
    <div className="w-full px-4 sm:px-6 py-3 bg-abyss/50 backdrop-blur-sm border-b border-gold/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Health */}
        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-40">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-parchment/60 font-cinzel">HP</span>
              <span className={`font-cinzel ${healthPercent <= 30 ? "text-red-500" : "text-parchment"}`}>{health}/{maxHealth}</span>
            </div>
            <div className="h-3 bg-abyss-light rounded-full overflow-hidden border border-parchment/20">
              <motion.div initial={{ width: "100%" }} animate={{ width: `${healthPercent}%` }} 
                transition={{ type: "spring", stiffness: 100 }} className={`h-full ${healthColor} rounded-full`} />
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-center">
          <p className="text-xs text-parchment/50 font-cinzel">GLORY</p>
          <motion.p key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-cinzel text-xl text-gold">{score}</motion.p>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <div>
            <p className="text-xs text-parchment/50 font-cinzel">GOLD</p>
            <motion.p key={gold} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-cinzel text-lg text-gold">{gold}</motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DOOR CHOICE
// ============================================
function DoorChoice({ onChoose }: { onChoose: (choice: "left" | "right") => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <h2 className="font-cinzel text-3xl text-gold mb-3">Choose Your Path</h2>
      <p className="font-crimson text-parchment/60 mb-8 italic max-w-md mx-auto">Two passages shrouded in darkness...</p>

      <div className="flex justify-center gap-8 sm:gap-12">
        {(["left", "right"] as const).map((side) => (
          <motion.button key={side} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
            onClick={() => onChoose(side)}
            className="group relative w-28 sm:w-36 h-44 sm:h-52 bg-gradient-to-b from-[#3a3a42] to-[#1a1a22] rounded-t-[60px] border-2 border-[#4a4a52] shadow-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {/* Door */}
            <div className="absolute inset-2 top-3 rounded-t-[50px] bg-gradient-to-b from-[#4a3528] to-[#2a1a10]">
              {[20, 50, 75].map((t) => (
                <div key={t} className="absolute left-0 right-0 h-3 bg-gradient-to-b from-[#5a5a62] to-[#3a3a42]" style={{ top: `${t}%` }} />
              ))}
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-3 border-gold bg-gold/30" />
            </div>
            
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors rounded-t-[60px]" />
            
            <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-cinzel text-xs text-parchment/50 group-hover:text-gold transition-colors uppercase tracking-wider whitespace-nowrap">
              {side} path
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// COMBAT
// ============================================
function Combat({ enemy, lastRoll, playerTurn, onRoll, onAttack }: {
  enemy: Enemy; lastRoll: number | null; playerTurn: boolean; onRoll: () => void; onAttack: () => void;
}) {
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md mx-auto">
      <h2 className="font-cinzel text-3xl text-blood mb-6">⚔️ Combat!</h2>

      {/* Enemy Card */}
      <div className="bg-gradient-to-b from-parchment to-parchment-dark rounded-lg p-5 border-4 border-trench-mud shadow-xl mb-6">
        <div className="text-5xl mb-2">{enemy.emoji}</div>
        <h3 className="font-cinzel text-xl text-blood-dark">{enemy.name}</h3>
        <p className="font-crimson text-sm text-abyss/60 italic mb-3">&ldquo;{enemy.description}&rdquo;</p>
        
        {/* Health bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-abyss/60 font-cinzel mb-1">
            <span>HP</span><span>{enemy.health}/{enemy.maxHealth}</span>
          </div>
          <div className="h-3 bg-abyss/20 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${healthPercent}%` }} transition={{ type: "spring", stiffness: 100 }}
              className={`h-full rounded-full ${healthPercent > 50 ? "bg-red-600" : healthPercent > 25 ? "bg-orange-500" : "bg-red-800"}`} />
          </div>
        </div>
        <p className="font-cinzel text-sm text-abyss/70">Damage: <span className="text-blood-dark font-bold">{enemy.damage}</span></p>
      </div>

      {/* Dice Result */}
      <div className="h-20 flex items-center justify-center mb-4">
        {lastRoll !== null ? (
          <motion.div key={lastRoll} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}
            className={`w-16 h-16 rounded-lg flex items-center justify-center font-cinzel text-3xl font-bold shadow-xl border-4
              ${lastRoll === 20 ? "bg-gold text-abyss border-gold-dark" : lastRoll === 1 ? "bg-blood text-white border-blood-dark" : "bg-parchment text-abyss border-trench-mud"}`}>
            {lastRoll}
          </motion.div>
        ) : (
          <p className="text-parchment/40 font-crimson">Roll the dice...</p>
        )}
      </div>

      {lastRoll !== null && (
        <p className={`mb-4 font-cinzel ${lastRoll === 20 ? "text-gold" : lastRoll === 1 ? "text-blood" : "text-parchment/70"}`}>
          {lastRoll === 20 ? "⚡ CRITICAL!" : lastRoll === 1 ? "💀 Fail!" : lastRoll >= 15 ? "Strong hit!" : lastRoll >= 10 ? "Hit!" : "Weak hit"}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="gold" onClick={onRoll} disabled={!playerTurn || lastRoll !== null}>🎲 Roll</Button>
        <Button variant="primary" icon="sword" onClick={onAttack} disabled={!playerTurn || lastRoll === null}>Attack</Button>
      </div>

      {!playerTurn && <p className="mt-4 font-cinzel text-blood animate-pulse">Enemy attacking...</p>}
    </motion.div>
  );
}

// ============================================
// TREASURE
// ============================================
function Treasure({ gold, onContinue }: { gold: number; onContinue: () => void }) {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <h2 className="font-cinzel text-3xl text-gold mb-6">💰 Treasure!</h2>
      
      <motion.button onClick={handleOpen} disabled={opened} whileHover={!opened ? { scale: 1.1 } : {}}
        className="text-7xl mb-6 focus:outline-none disabled:cursor-default">
        {opened ? "📖" : "📦"}
      </motion.button>

      {!opened && <p className="text-parchment/50 font-crimson mb-4">Click to open</p>}

      {opened && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-cinzel text-2xl text-gold mb-6">+{gold} Gold</p>
          <Button variant="gold" onClick={onContinue}>Continue</Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// TRAP
// ============================================
function Trap({ damage, onContinue }: { damage: number; onContinue: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <motion.div initial={{ rotate: 0 }} animate={{ rotate: [-10, 10, 0] }} transition={{ duration: 0.5 }} className="text-7xl mb-4">⚠️</motion.div>
      <h2 className="font-cinzel text-3xl text-blood mb-3">Trap!</h2>
      <p className="font-crimson text-parchment/60 italic mb-6">Hidden blades spring from the walls!</p>
      
      <div className="bg-blood/20 border border-blood/40 rounded-lg px-6 py-3 inline-block mb-6">
        <p className="font-cinzel text-xl text-blood">-{damage} HP</p>
      </div>

      <div><Button variant="danger" onClick={onContinue}>Press Forward</Button></div>
    </motion.div>
  );
}

// ============================================
// REST
// ============================================
function Rest({ heal, onContinue }: { heal: number; onContinue: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🔥</motion.div>
      <h2 className="font-cinzel text-3xl text-gold mb-3">Rest</h2>
      <p className="font-crimson text-parchment/60 italic mb-6">A sheltered alcove with a campfire...</p>
      
      <div className="bg-green-900/30 border border-green-500/30 rounded-lg px-6 py-3 inline-block mb-6">
        <p className="font-cinzel text-xl text-green-400">+{heal} HP</p>
      </div>

      <div><Button variant="gold" onClick={onContinue}>Continue</Button></div>
    </motion.div>
  );
}

// ============================================
// ADVENTURE LOG
// ============================================
function AdventureLog({ entries }: { entries: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const colors: Record<string, string> = {
    narrative: "text-parchment-dark", combat: "text-blood-dark", loot: "text-gold-dark", danger: "text-blood", success: "text-green-700"
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-cinzel text-base text-gold mb-3 text-center border-b border-gold/20 pb-2">Chronicle</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 text-sm">
        {entries.map((e) => (
          <div key={e.id} className="pl-3 relative">
            <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-gold/30" />
            <p className={`font-crimson leading-relaxed ${colors[e.type]}`}>{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN CONTENT
// ============================================
function DungeonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [health, setHealth] = useState(100);
  const [gold, setGold] = useState(0);
  const [score, setScore] = useState(0);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([
    { id: generateId(), text: isDemo ? "DEMO: You enter the trenches..." : "You descend into the trenches...", type: "narrative" },
  ]);

  // Pre-generated random values for trap and rest
  const [trapDamage] = useState(() => Math.floor(Math.random() * 15) + 10);
  const [restHeal] = useState(() => Math.floor(Math.random() * 20) + 15);
  const [treasureGold] = useState(() => Math.floor(Math.random() * 100) + 50);

  const maxHealth = 100;
  const currentEncounter = DEMO_FLOW[encounterIndex % DEMO_FLOW.length];

  const addLog = useCallback((text: string, type: LogEntry["type"] = "narrative") => {
    setLogEntries((prev) => [...prev, { id: generateId(), text, type }]);
  }, []);

  // Initialize combat
  useEffect(() => {
    if (currentEncounter === "combat" && !currentEnemy) {
      const enemy = { ...ENEMIES[Math.floor(Math.random() * ENEMIES.length)] };
      setCurrentEnemy(enemy);
      addLog(`A ${enemy.name} appears!`, "danger");
    }
  }, [currentEncounter, currentEnemy, addLog]);

  // Victory check
  useEffect(() => {
    if (encounterIndex >= 10 && currentEncounter === "doors") {
      router.push(`/end?result=victory&score=${score}&gold=${gold}${isDemo ? "&demo=true" : ""}`);
    }
  }, [encounterIndex, currentEncounter, router, score, gold, isDemo]);

  const handleDoorChoice = useCallback((choice: "left" | "right") => {
    addLog(`You take the ${choice} passage...`, "narrative");
    setEncounterIndex((prev) => prev + 1);
  }, [addLog]);

  const handleRoll = useCallback(() => {
    setLastRoll(Math.floor(Math.random() * 20) + 1);
  }, []);

  const handleAttack = useCallback(() => {
    if (!currentEnemy || lastRoll === null) return;

    const baseDamage = 5;
    const mult = lastRoll === 20 ? 3 : lastRoll >= 15 ? 2 : 1;
    const dmg = Math.floor((baseDamage + lastRoll / 2) * mult);

    const newEnemyHp = currentEnemy.health - dmg;
    setCurrentEnemy({ ...currentEnemy, health: Math.max(0, newEnemyHp) });

    addLog(lastRoll === 20 ? `CRITICAL! ${dmg} damage!` : `You deal ${dmg} damage.`, "combat");

    if (newEnemyHp <= 0) {
      const reward = Math.floor(Math.random() * 50) + 20;
      setGold((prev) => prev + reward);
      setScore((prev) => prev + 100);
      addLog(`${currentEnemy.name} defeated! +${reward} gold!`, "success");
      setCurrentEnemy(null);
      setLastRoll(null);
      setEncounterIndex((prev) => prev + 1);
    } else {
      setPlayerTurn(false);
      setTimeout(() => {
        const enemyDmg = Math.floor(currentEnemy.damage * (0.5 + Math.random() * 0.5));
        setHealth((prev) => {
          const newHp = Math.max(0, prev - enemyDmg);
          if (newHp <= 0) router.push(`/end?result=defeat${isDemo ? "&demo=true" : ""}`);
          return newHp;
        });
        addLog(`${currentEnemy.name} hits for ${enemyDmg}!`, "danger");
        setPlayerTurn(true);
        setLastRoll(null);
      }, 1200);
    }
  }, [currentEnemy, lastRoll, addLog, router, isDemo]);

  const handleTreasure = useCallback(() => {
    setGold((prev) => prev + treasureGold);
    setScore((prev) => prev + 50);
    addLog(`Found ${treasureGold} gold!`, "loot");
    setEncounterIndex((prev) => prev + 1);
  }, [addLog, treasureGold]);

  const handleTrap = useCallback(() => {
    setHealth((prev) => {
      const newHp = Math.max(0, prev - trapDamage);
      if (newHp <= 0) router.push(`/end?result=defeat${isDemo ? "&demo=true" : ""}`);
      return newHp;
    });
    addLog(`Trap! -${trapDamage} HP!`, "danger");
    setEncounterIndex((prev) => prev + 1);
  }, [addLog, router, isDemo, trapDamage]);

  const handleRest = useCallback(() => {
    setHealth((prev) => Math.min(maxHealth, prev + restHeal));
    addLog(`Rested. +${restHeal} HP.`, "success");
    setEncounterIndex((prev) => prev + 1);
  }, [addLog, restHeal]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <DungeonAmbience />

      {/* Demo banner */}
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-mystic/90 py-2 text-center border-b border-mystic-light/20">
          <p className="font-cinzel text-sm text-parchment">🎮 <span className="text-gold">DEMO</span> — Rewards simulated</p>
        </div>
      )}

      {/* HUD */}
      <div className={`relative z-40 ${isDemo ? "pt-10" : ""}`}>
        <HUD health={health} maxHealth={maxHealth} gold={gold} score={score} />
      </div>

      {/* Main area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-80px)]">
        {/* Encounter */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentEncounter === "doors" && <DoorChoice key="d" onChoose={handleDoorChoice} />}
            {currentEncounter === "combat" && currentEnemy && (
              <Combat key="c" enemy={currentEnemy} lastRoll={lastRoll} playerTurn={playerTurn} onRoll={handleRoll} onAttack={handleAttack} />
            )}
            {currentEncounter === "treasure" && <Treasure key="t" gold={treasureGold} onContinue={handleTreasure} />}
            {currentEncounter === "trap" && <Trap key="tr" damage={trapDamage} onContinue={handleTrap} />}
            {currentEncounter === "rest" && <Rest key="r" heal={restHeal} onContinue={handleRest} />}
          </AnimatePresence>
        </div>

        {/* Log */}
        <div className="lg:w-72 h-64 lg:h-auto flex-shrink-0">
          <Panel variant="parchment" className="h-full p-3">
            <AdventureLog entries={logEntries} />
          </Panel>
        </div>
      </div>

      {/* Retreat */}
      <div className="fixed bottom-4 left-4 z-20">
        <Button variant="ghost" onClick={() => router.push("/")}>← Retreat</Button>
      </div>
    </main>
  );
}

function DungeonLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-abyss">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-4xl">⚔️</motion.div>
    </div>
  );
}

export default function DungeonPage() {
  return (
    <Suspense fallback={<DungeonLoading />}>
      <DungeonContent />
    </Suspense>
  );
}
