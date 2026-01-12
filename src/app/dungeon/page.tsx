"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn, generateId } from "@/lib/utils";
import { CharacterClass } from "@/types/game";
import { CLASSES } from "@/data/classes";
import { getRandomEnemy, EnemyTemplate } from "@/data/enemies";
import {
  Encounter,
  DialogueOption,
  FLOOR_1_ENCOUNTERS,
  FLOOR_2_ENCOUNTERS,
  BOSS_ENCOUNTERS,
  checkRequirement,
} from "@/data/encounters";

// ============================================
// TYPES
// ============================================
interface CharacterState {
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  damage: number;
  defense: number;
  speed: number;
  critChance: number;
  skillCooldowns: Record<string, number>;
}

interface PlayerState {
  gold: number;
  score: number;
  items: string[];
  unlocks: string[];
  enemiesDefeated: number;
}

interface Enemy {
  id: string;
  template: EnemyTemplate;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
}

type GamePhase = "select" | "encounter" | "combat" | "outcome";

// ============================================
// EMBER PARTICLES
// ============================================
function EmberParticles() {
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    setEmbers(Array.from({ length: 15 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 4, size: 2 + Math.random() * 2 })));
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
          style={{ width: e.size, height: e.size, background: "var(--ember)", boxShadow: `0 0 ${e.size * 2}px var(--ember)` }}
        />
      ))}
    </div>
  );
}

// ============================================
// VIAL HEALTH BAR
// ============================================
function VialBar({ value, max, type, compact = false }: { value: number; max: number; type: "hp" | "mana"; compact?: boolean }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-1", compact ? "w-full" : "")}>
      <div className={cn("rounded-l", compact ? "w-1.5 h-3" : "w-2 h-4", type === "hp" ? "bg-blood" : "bg-arcane")} />
      <div className={cn("flex-1 rounded-r overflow-hidden bg-bg2", compact ? "h-2" : "h-3")}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100 }}
          className={cn("h-full", type === "hp" ? "bg-gradient-to-r from-blood to-ember" : "bg-gradient-to-r from-arcane to-ice")}
        />
      </div>
    </div>
  );
}

// ============================================
// RUNE STAT BAR
// ============================================
function RuneBar({ value, max, classType }: { value: number; max: number; classType?: CharacterClass }) {
  const notches = Math.min(7, max);
  const filledNotches = Math.round((value / max) * notches);

  return (
    <div className="td-runebar">
      {[...Array(notches)].map((_, i) => (
        <div key={i} className={cn("td-runebar-notch", i < filledNotches && "filled", i < filledNotches && classType)} />
      ))}
    </div>
  );
}

// ============================================
// SIDE STATUS PANEL (Replaces Header)
// ============================================
function SideStatus({
  character,
  playerState,
  floor,
  isDemo,
  onRetreat,
}: {
  character: CharacterState;
  playerState: PlayerState;
  floor: number;
  isDemo: boolean;
  onRetreat: () => void;
}) {
  const classData = CLASSES[character.class];

  return (
    <div className="fixed top-4 right-4 z-40 w-64">
      {/* Demo banner */}
      {isDemo && (
        <div className="mb-2 px-3 py-2 bg-arcane/20 border border-arcane/30 rounded-lg text-center">
          <span className="text-xs text-text1 font-ui">🎮 <span className="text-gold1 font-semibold">DEMO</span></span>
        </div>
      )}

      {/* Character card */}
      <div className="td-panel p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: `linear-gradient(135deg, ${classData?.color}30, transparent)` }}
          >
            {classData?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-gold1 truncate">{character.name}</p>
            <p className="text-xs text-text2 font-ui">Lv.{character.level} {classData?.name}</p>
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs">❤️</span>
            <VialBar value={character.health} max={character.maxHealth} type="hp" compact />
            <span className="text-xs text-text2 font-ui tabular-nums w-12 text-right">{character.health}/{character.maxHealth}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">💧</span>
            <VialBar value={character.mana} max={character.maxMana} type="mana" compact />
            <span className="text-xs text-text2 font-ui tabular-nums w-12 text-right">{character.mana}/{character.maxMana}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-line" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="td-label text-[10px]">Floor</p>
            <p className="font-display text-xl text-gold1">{floor}</p>
          </div>
          <div className="text-center">
            <p className="td-label text-[10px]">Glory</p>
            <motion.p key={playerState.score} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-display text-xl text-gold1">
              {playerState.score}
            </motion.p>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center justify-center gap-2 py-2 bg-gold1/10 rounded-lg">
          <span className="text-lg">💰</span>
          <motion.span key={playerState.gold} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="font-display text-lg text-gold1">
            {playerState.gold}
          </motion.span>
        </div>

        {/* Retreat */}
        <button onClick={onRetreat} className="w-full td-btn td-btn-ghost text-sm py-2">
          ← Retreat
        </button>
      </div>
    </div>
  );
}

// ============================================
// CLASS SELECTION
// ============================================
function ClassSelection({ onSelect }: { onSelect: (name: string, cls: CharacterClass) => void }) {
  const [selected, setSelected] = useState<CharacterClass | null>(null);
  const [name, setName] = useState("");
  const classes = Object.entries(CLASSES) as [CharacterClass, typeof CLASSES[CharacterClass]][];

  return (
    <div className="min-h-screen bg-bg0 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-void" />
      <EmberParticles />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Image src="/logo.png" alt="T&D" width={100} height={100} className="drop-shadow-[0_0_20px_rgba(232,207,138,0.3)]" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gold1 text-glow-gold mb-2">Choose Your Oath</h1>
          <p className="text-text2 font-ui">Select a champion to begin your descent</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-sm mb-8">
          <label className="td-label block mb-2 text-center">Hero Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." maxLength={16} className="td-input text-center text-lg" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-8">
          {classes.map(([id, cls], index) => {
            const isSelected = selected === id;
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setSelected(id)}
                className={cn("relative p-6 rounded-lg text-left transition-all duration-300 group td-panel td-rivets", isSelected && "ring-2 ring-gold1 shadow-[0_0_40px_rgba(232,207,138,0.25)]")}
              >
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 w-8 h-8 bg-gold1 rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-bg0 font-bold">✓</span>
                  </motion.div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${cls.color}30, ${cls.color}10)` }}>
                    {cls.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold" style={{ color: cls.color }}>{cls.name}</h3>
                    <p className="text-text2 text-sm font-ui">{cls.difficulty}</p>
                  </div>
                </div>

                <p className="text-text1 text-sm font-ui mb-4 line-clamp-2">{cls.description}</p>

                <div className="space-y-3 mb-4">
                  {[
                    { label: "Health", value: cls.baseStats.health, max: 150, icon: "❤️" },
                    { label: "Attack", value: cls.baseStats.damage, max: 20, icon: "⚔️" },
                    { label: "Defense", value: cls.baseStats.defense, max: 12, icon: "🛡️" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="text-sm">{stat.icon}</span>
                      <span className="text-xs text-text2 w-14 font-ui">{stat.label}</span>
                      <div className="flex-1"><RuneBar value={stat.value} max={stat.max} classType={id} /></div>
                      <span className="text-xs text-text1 w-6 text-right font-ui tabular-nums">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t border-line">
                  {cls.skills.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="w-10 h-10 rounded-lg bg-bg2 border border-line2 flex items-center justify-center text-lg" title={skill.name}>{skill.icon}</div>
                  ))}
                  <span className="flex items-center text-text2 text-xs font-ui ml-auto">+{cls.skills.length - 3} skills</span>
                </div>

                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold1/5 to-transparent animate-sheen-sweep" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center">
          <button onClick={() => selected && name.trim() && onSelect(name.trim(), selected)} disabled={!selected || !name.trim()} className="td-btn td-btn-primary text-lg px-10 py-4">
            ⚔️ Begin the Descent
          </button>
          {!selected && <p className="text-gold2/60 text-sm mt-4 font-ui">↑ Select a class above</p>}
          {selected && !name.trim() && <p className="text-gold2/60 text-sm mt-4 font-ui">↑ Enter your hero name</p>}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// ENCOUNTER SCREEN
// ============================================
function EncounterScreen({ encounter, character, playerState, onChoice }: { encounter: Encounter; character: CharacterState; playerState: PlayerState; onChoice: (option: DialogueOption) => void }) {
  const dialogue = encounter.dialogue;
  if (!dialogue) return null;

  const playerCheck = { class: character.class, gold: playerState.gold, items: playerState.items, stats: { strength: character.damage, intelligence: character.mana, dexterity: character.speed } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl">
      <div className="td-panel-elevated td-rivets overflow-hidden">
        <div className="relative h-28 bg-gradient-to-b from-bg2 to-panel flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,207,138,0.08),transparent_70%)]" />
          <span className="text-5xl opacity-40">🏰</span>
        </div>

        <div className="p-5">
          <h2 className="font-display text-2xl text-gold1 mb-2">{encounter.title}</h2>
          <p className="text-text2 font-flavor italic text-sm mb-4">{encounter.description}</p>

          <div className="td-panel p-4 mb-4">
            {dialogue.speaker && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line">
                <div className="w-8 h-8 rounded-full bg-gold2/20 flex items-center justify-center text-gold1 text-sm">💬</div>
                <span className="font-display text-gold1 text-sm">{dialogue.speaker}</span>
              </div>
            )}
            <p className="text-text0 font-flavor leading-relaxed">"{dialogue.text}"</p>
          </div>

          <div className="space-y-2">
            <span className="td-label text-[10px]">Your Response</span>
            {dialogue.options.map((option, i) => {
              const meetsReq = checkRequirement(option.requirement, playerCheck);
              const reqText = option.requirement?.class ? `[${CLASSES[option.requirement.class].name}]` : option.requirement?.gold ? `[${option.requirement.gold}g]` : "";

              return (
                <motion.button
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => meetsReq && onChoice(option)}
                  disabled={!meetsReq}
                  className={cn("td-choice py-3", !meetsReq && "opacity-50")}
                >
                  <span className="td-choice-num text-xs w-6 h-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className={cn("text-sm font-ui", meetsReq ? "text-text0" : "text-text2")}>{option.text}</p>
                    {reqText && <p className={cn("text-xs mt-0.5 font-ui", meetsReq ? "text-gold2/70" : "text-blood/70")}>{reqText}</p>}
                  </div>
                  {meetsReq && <span className="text-text2 text-sm">→</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// OUTCOME SCREEN
// ============================================
function OutcomeScreen({ text, effects, onContinue }: { text: string; effects: Record<string, unknown>; onContinue: () => void }) {
  const goldVal = typeof effects.gold === "number" ? effects.gold : 0;
  const healthVal = typeof effects.health === "number" ? effects.health : 0;
  const scoreVal = typeof effects.score === "number" ? effects.score : 0;
  const hasItem = Boolean(effects.item);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
      <div className="td-panel-elevated p-6 text-center">
        <p className="text-text0 font-flavor leading-relaxed mb-5">"{text}"</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {effects.gold !== undefined && (
            <div className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-ui font-semibold text-sm", goldVal > 0 ? "bg-gold2/20 text-gold1" : "bg-blood/20 text-blood")}>
              💰 {goldVal > 0 ? "+" : ""}{goldVal}
            </div>
          )}
          {effects.health !== undefined && (
            <div className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-ui font-semibold text-sm", healthVal > 0 ? "bg-venom/20 text-venom" : "bg-blood/20 text-blood")}>
              ❤️ {healthVal > 0 ? "+" : ""}{healthVal}
            </div>
          )}
          {scoreVal > 0 && <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-arcane/20 text-arcane font-ui font-semibold text-sm">⭐ +{scoreVal}</div>}
          {hasItem && <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-ice/20 text-ice font-ui font-semibold text-sm">📦 Item!</div>}
        </div>

        <button onClick={onContinue} className="td-btn td-btn-primary">Continue →</button>
      </div>
    </motion.div>
  );
}

// ============================================
// COMBAT SCREEN
// ============================================
function CombatScreen({ character, enemy, onAction }: { character: CharacterState; enemy: Enemy; onAction: (action: "attack" | "defend" | "skill" | "flee", result: number, skillId?: string) => void }) {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [phase, setPhase] = useState<"roll" | "act">("roll");
  const [enemyHurt, setEnemyHurt] = useState(false);
  const classData = CLASSES[character.class];
  const enemyHpPercent = (enemy.health / enemy.maxHealth) * 100;

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const result = Math.floor(Math.random() * 20) + 1;
      setDiceResult(result);
      setIsRolling(false);
      setPhase("act");
    }, 800);
  };

  const doAction = (action: "attack" | "defend" | "skill" | "flee", skillId?: string) => {
    if (action === "attack" || action === "skill") {
      setEnemyHurt(true);
      setTimeout(() => setEnemyHurt(false), 300);
    }
    setTimeout(() => {
      onAction(action, diceResult || 10, skillId);
      setDiceResult(null);
      setPhase("roll");
    }, 300);
  };

  const isCrit = diceResult === 20;
  const isFumble = diceResult === 1;

  return (
    <div className="w-full max-w-xl">
      <div className="td-panel-elevated td-rivets overflow-hidden">
        <div className="bg-blood/10 border-b border-blood/20 p-3 text-center">
          <h2 className="font-display text-xl text-blood">⚔️ COMBAT ⚔️</h2>
        </div>

        <div className="p-5">
          {/* Enemy */}
          <div className="td-panel p-4 mb-5">
            <div className="flex items-center gap-4">
              <motion.div animate={enemyHurt ? { x: [-10, 10, -10, 0] } : { y: [0, -4, 0] }} transition={enemyHurt ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} className="text-5xl">
                {enemy.template.icon}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-text0">{enemy.template.name}</h3>
                  <span className="px-2 py-0.5 bg-blood/20 rounded text-blood text-xs font-ui">T{enemy.template.tier}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-text2 font-ui mb-1">
                    <span>HP</span>
                    <span>{enemy.health}/{enemy.maxHealth}</span>
                  </div>
                  <div className="h-2.5 bg-bg2 rounded-full overflow-hidden border border-line2">
                    <motion.div animate={{ width: `${enemyHpPercent}%` }} transition={{ type: "spring", stiffness: 100 }} className={cn("h-full rounded-full", enemyHpPercent > 50 ? "bg-blood" : "bg-ember")} />
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-text2 font-ui">
                  <span>⚔️ {enemy.damage}</span>
                  <span>🛡️ {enemy.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dice & Actions */}
          <div className="text-center">
            {phase === "roll" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={rollDice}
                  disabled={isRolling}
                  className={cn("w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-display mx-auto mb-3", "bg-gradient-to-b from-gold2 to-gold3 border-2 border-gold1/50 shadow-deep", isRolling && "animate-dice-tumble")}
                >
                  🎲
                </motion.button>
                <p className="text-text2 font-ui text-sm">Click to roll</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={cn("w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-display font-bold mx-auto mb-3 border-2", isCrit ? "bg-gold1 border-gold0 text-bg0" : isFumble ? "bg-blood border-blood text-text0" : "bg-panel border-line text-text0")}
                >
                  {diceResult}
                </motion.div>
                <p className={cn("text-sm font-display mb-4", isCrit ? "text-gold1" : isFumble ? "text-blood" : "text-text1")}>
                  {isCrit ? "⚡ CRITICAL!" : isFumble ? "💀 FUMBLE!" : `Rolled: ${diceResult}`}
                </p>

                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-3">
                  <button onClick={() => doAction("attack")} className="td-btn td-btn-danger py-2 text-sm">⚔️ Attack</button>
                  <button onClick={() => doAction("defend")} className="td-btn td-btn-secondary py-2 text-sm">🛡️ Defend</button>
                </div>

                <div className="flex justify-center gap-2 mb-3">
                  {classData?.skills.slice(0, 3).map((skill) => {
                    const onCd = (character.skillCooldowns[skill.id] || 0) > 0;
                    const noMp = character.mana < skill.manaCost;
                    return (
                      <motion.button
                        key={skill.id}
                        whileHover={!onCd && !noMp ? { scale: 1.1 } : {}}
                        onClick={() => !onCd && !noMp && doAction("skill", skill.id)}
                        disabled={onCd || noMp}
                        className={cn("relative w-10 h-10 rounded-lg border flex items-center justify-center text-lg", onCd || noMp ? "bg-bg2 border-line2 opacity-40" : "bg-arcane/20 border-arcane/50 hover:border-arcane")}
                        title={`${skill.name} (${skill.manaCost} MP)`}
                      >
                        {skill.icon}
                        {onCd && <div className="absolute inset-0 bg-bg0/80 rounded-lg flex items-center justify-center text-xs font-ui font-bold">{character.skillCooldowns[skill.id]}</div>}
                      </motion.button>
                    );
                  })}
                </div>

                <button onClick={() => doAction("flee")} className="text-text2 hover:text-text1 text-xs font-ui">🏃 Flee</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN GAME
// ============================================
function DungeonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [phase, setPhase] = useState<GamePhase>("select");
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({ gold: 50, score: 0, items: [], unlocks: [], enemiesDefeated: 0 });
  const [floor, setFloor] = useState(1);
  const [room, setRoom] = useState(0);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [outcome, setOutcome] = useState<{ text: string; effects: Record<string, unknown> } | null>(null);
  const [encounterHistory, setEncounterHistory] = useState<string[]>([]);

  const handleClassSelect = (name: string, cls: CharacterClass) => {
    const classData = CLASSES[cls];
    setCharacter({ name, class: cls, level: 1, health: classData.baseStats.health, maxHealth: classData.baseStats.health, mana: 50, maxMana: 50, damage: classData.baseStats.damage, defense: classData.baseStats.defense, speed: classData.baseStats.speed, critChance: 0.1, skillCooldowns: {} });
    const firstEnc = FLOOR_1_ENCOUNTERS[0];
    setCurrentEncounter(firstEnc);
    setEncounterHistory([firstEnc.id]);
    setPhase("encounter");
  };

  const handleChoice = useCallback((option: DialogueOption) => {
    if (!character) return;
    const effects = option.outcome.effects;

    setPlayerState((prev) => ({ ...prev, gold: prev.gold + ((effects.gold as number) || 0), score: prev.score + ((effects.score as number) || 0), items: effects.item ? [...prev.items, effects.item as string] : prev.items, unlocks: effects.unlock ? [...prev.unlocks, effects.unlock as string] : prev.unlocks }));

    if (effects.health) {
      setCharacter((prev) => {
        if (!prev) return prev;
        const newHp = Math.min(prev.maxHealth, Math.max(0, prev.health + (effects.health as number)));
        if (newHp <= 0) router.push(`/end?result=defeat&score=${playerState.score}&gold=${playerState.gold}&floors=${floor}&kills=${playerState.enemiesDefeated}&class=${prev.class}${isDemo ? "&demo=true" : ""}`);
        return { ...prev, health: newHp };
      });
    }

    if (effects.combat) {
      const template = getRandomEnemy(floor + 1);
      setCurrentEnemy({ id: generateId(), template, health: Math.floor(template.stats.health * (1 + floor * 0.2)), maxHealth: Math.floor(template.stats.health * (1 + floor * 0.2)), damage: Math.floor(template.stats.damage * (1 + floor * 0.15)), defense: template.stats.defense });
      setPhase("combat");
    } else {
      setOutcome({ text: option.outcome.text, effects });
      setPhase("outcome");
    }
  }, [character, floor, playerState.score, isDemo, router]);

  const handleCombatAction = useCallback((action: string, diceResult: number) => {
    if (!character || !currentEnemy) return;

    let playerDmg = 0;
    let enemyDmg = 0;

    if (action === "flee") {
      if (diceResult >= 12) { setCurrentEnemy(null); nextEncounter(); return; }
      enemyDmg = Math.max(1, Math.floor(currentEnemy.damage * 1.2) - character.defense);
    } else if (action === "defend") {
      enemyDmg = Math.max(1, Math.floor((currentEnemy.damage - character.defense) * 0.5));
      playerDmg = Math.floor(character.damage * 0.3);
    } else {
      const isCrit = diceResult === 20;
      const isFumble = diceResult === 1;
      const base = character.damage + Math.floor(diceResult / 3);
      playerDmg = Math.max(1, Math.floor(base * (isCrit ? 2 : isFumble ? 0.5 : 1)) - currentEnemy.defense);
      enemyDmg = Math.max(1, currentEnemy.damage - character.defense);
    }

    const newEnemyHp = Math.max(0, currentEnemy.health - playerDmg);
    const newPlayerHp = Math.max(0, character.health - enemyDmg);

    setCurrentEnemy({ ...currentEnemy, health: newEnemyHp });
    setCharacter({ ...character, health: newPlayerHp });

    if (newPlayerHp <= 0) {
      setTimeout(() => router.push(`/end?result=defeat&score=${playerState.score}&gold=${playerState.gold}&floors=${floor}&kills=${playerState.enemiesDefeated}&class=${character.class}${isDemo ? "&demo=true" : ""}`), 800);
    } else if (newEnemyHp <= 0) {
      const reward = Math.floor(Math.random() * 40) + 30 + currentEnemy.template.tier * 15;
      setPlayerState((prev) => ({ ...prev, gold: prev.gold + reward, score: prev.score + 100 + currentEnemy.template.tier * 25, enemiesDefeated: prev.enemiesDefeated + 1 }));
      setOutcome({ text: `You defeated the ${currentEnemy.template.name}!`, effects: { gold: reward, score: 100 } });
      setPhase("outcome");
    }
  }, [character, currentEnemy, playerState.score, isDemo, router]);

  const nextEncounter = useCallback(() => {
    setCurrentEnemy(null);
    setOutcome(null);
    setRoom((r) => r + 1);

    const encounters = floor === 1 ? FLOOR_1_ENCOUNTERS : floor === 2 ? FLOOR_2_ENCOUNTERS : BOSS_ENCOUNTERS;
    const available = encounters.filter((e) => !encounterHistory.includes(e.id));

    if (available.length === 0 || room >= 5) {
      if (floor >= 3) {
        router.push(`/end?result=victory&score=${playerState.score}&gold=${playerState.gold}&floors=${floor}&kills=${playerState.enemiesDefeated}&class=${character?.class || "warrior"}${isDemo ? "&demo=true" : ""}`);
      } else {
        setFloor((f) => f + 1);
        setRoom(0);
        setEncounterHistory([]);
        const nextFloorEnc = (floor === 1 ? FLOOR_2_ENCOUNTERS : BOSS_ENCOUNTERS)[0];
        setCurrentEncounter(nextFloorEnc);
        setEncounterHistory([nextFloorEnc.id]);
        setPhase("encounter");
      }
    } else {
      const next = available[Math.floor(Math.random() * available.length)];
      setCurrentEncounter(next);
      setEncounterHistory((prev) => [...prev, next.id]);
      setPhase("encounter");
    }
  }, [floor, room, encounterHistory, playerState, isDemo, router]);

  if (phase === "select") return <ClassSelection onSelect={handleClassSelect} />;
  if (!character) return null;

  return (
    <div className="min-h-screen bg-bg0 relative">
      <div className="fixed inset-0 bg-radial-void pointer-events-none" />
      <EmberParticles />

      {/* Side status panel */}
      <SideStatus character={character} playerState={playerState} floor={floor} isDemo={isDemo} onRetreat={() => router.push("/")} />

      {/* Game content - centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pr-72">
        <AnimatePresence mode="wait">
          {phase === "encounter" && currentEncounter && <EncounterScreen key={currentEncounter.id} encounter={currentEncounter} character={character} playerState={playerState} onChoice={handleChoice} />}
          {phase === "combat" && currentEnemy && <CombatScreen key={currentEnemy.id} character={character} enemy={currentEnemy} onAction={handleCombatAction} />}
          {phase === "outcome" && outcome && <OutcomeScreen key="outcome" text={outcome.text} effects={outcome.effects} onContinue={nextEncounter} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DungeonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg0"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-5xl">⚔️</motion.div></div>}>
      <DungeonContent />
    </Suspense>
  );
}
