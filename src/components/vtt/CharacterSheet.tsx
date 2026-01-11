"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CharacterClass } from "@/types/game";
import { CLASSES } from "@/data/classes";

interface CharacterSheetProps {
  character: {
    name: string;
    class: CharacterClass;
    level: number;
    experience: number;
    stats: {
      health: number;
      maxHealth: number;
      mana: number;
      maxMana: number;
      damage: number;
      defense: number;
      speed: number;
      critChance: number;
    };
    equipment?: {
      weapon: { name: string; icon: string } | null;
      armor: { name: string; icon: string } | null;
      accessory: { name: string; icon: string } | null;
    };
    skillCooldowns?: Record<string, number>;
  };
  onSkillUse?: (skillId: string) => void;
  compact?: boolean;
  className?: string;
}

function StatBar({
  label,
  current,
  max,
  color,
  icon,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
  icon: string;
}) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-parchment/60 font-cinzel flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span className={cn("font-cinzel font-bold", color)}>
          {current}/{max}
        </span>
      </div>
      <div className="h-3 bg-abyss rounded-full overflow-hidden border border-parchment/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100 }}
          className={cn("h-full rounded-full relative", color.replace("text-", "bg-"))}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          {/* Liquid wobble */}
          <motion.div
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 right-0 w-2 h-full bg-white/10 rounded-r-full"
          />
        </motion.div>
      </div>
    </div>
  );
}

function StatNumber({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex flex-col items-center p-2 bg-abyss/50 rounded border border-parchment/10">
      <span className="text-lg">{icon}</span>
      <span className="font-cinzel text-gold text-lg font-bold">{value}</span>
      <span className="text-[10px] text-parchment/50 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SkillButton({
  skill,
  cooldown,
  onUse,
  disabled,
}: {
  skill: { id: string; name: string; icon: string; cooldown: number; manaCost: number };
  cooldown: number;
  onUse: () => void;
  disabled: boolean;
}) {
  const isOnCooldown = cooldown > 0;

  return (
    <motion.button
      whileHover={!disabled && !isOnCooldown ? { scale: 1.1 } : {}}
      whileTap={!disabled && !isOnCooldown ? { scale: 0.95 } : {}}
      onClick={onUse}
      disabled={disabled || isOnCooldown}
      className={cn(
        "relative w-12 h-12 rounded-lg flex items-center justify-center",
        "bg-gradient-to-br from-abyss-light to-abyss",
        "border-2 transition-all",
        isOnCooldown
          ? "border-parchment/20 opacity-50"
          : "border-gold/30 hover:border-gold/60 hover:shadow-candle",
        disabled && "opacity-30 cursor-not-allowed"
      )}
      title={`${skill.name} (${skill.manaCost} mana, ${skill.cooldown}t CD)`}
    >
      <span className="text-xl">{skill.icon}</span>
      
      {/* Cooldown overlay */}
      {isOnCooldown && (
        <div className="absolute inset-0 flex items-center justify-center bg-abyss/70 rounded-lg">
          <span className="font-cinzel text-parchment/80 text-sm">{cooldown}</span>
        </div>
      )}

      {/* Mana cost indicator */}
      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-mystic flex items-center justify-center">
        <span className="text-[8px] text-white font-bold">{skill.manaCost}</span>
      </div>
    </motion.button>
  );
}

function EquipmentSlot({
  slot,
  item,
}: {
  slot: string;
  item: { name: string; icon: string } | null;
}) {
  const slotIcons: Record<string, string> = {
    weapon: "⚔️",
    armor: "🛡️",
    accessory: "💍",
    helmet: "⛑️",
    boots: "👢",
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded flex items-center justify-center",
        "bg-abyss/50 border border-parchment/10",
        item && "border-gold/30"
      )}
      title={item?.name || `Empty ${slot}`}
    >
      <span className="text-lg">{item?.icon || slotIcons[slot] || "◯"}</span>
    </div>
  );
}

export default function CharacterSheet({
  character,
  onSkillUse,
  compact = false,
  className,
}: CharacterSheetProps) {
  const classData = CLASSES[character.class];
  const expToNextLevel = character.level * 100;
  const expPercent = (character.experience / expToNextLevel) * 100;

  if (compact) {
    return (
      <div className={cn("bg-abyss-light/80 backdrop-blur rounded-lg border border-gold/10 p-3", className)}>
        <div className="flex items-center gap-3">
          {/* Class icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: classData?.color + "30" }}
          >
            {classData?.icon || "⚔️"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-gold text-sm truncate">{character.name}</span>
              <span className="text-xs text-parchment/50">Lv.{character.level}</span>
            </div>

            {/* HP bar */}
            <div className="mt-1 h-2 bg-abyss rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(character.stats.health / character.stats.maxHealth) * 100}%` }}
                className="h-full bg-blood rounded-full"
              />
            </div>

            {/* MP bar */}
            <div className="mt-1 h-1.5 bg-abyss rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(character.stats.mana / character.stats.maxMana) * 100}%` }}
                className="h-full bg-mystic rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
        "rounded-lg border-2 border-gold/20 shadow-candle-lg",
        "overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div
        className="p-4 border-b border-gold/10"
        style={{ background: `linear-gradient(135deg, ${classData?.color}20, transparent)` }}
      >
        <div className="flex items-center gap-4">
          {/* Portrait */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${classData?.color}40, ${classData?.color}20)`,
              border: `2px solid ${classData?.color}60`,
            }}
          >
            {classData?.icon || "⚔️"}
          </div>

          {/* Name & Class */}
          <div className="flex-1">
            <h3 className="font-cinzel text-xl text-gold font-bold">{character.name}</h3>
            <p className="font-crimson text-parchment/60 text-sm">
              Level {character.level} {classData?.name || "Adventurer"}
            </p>

            {/* XP bar */}
            <div className="mt-2 h-1.5 bg-abyss rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${expPercent}%` }}
                className="h-full bg-gold/60 rounded-full"
              />
            </div>
            <p className="text-[10px] text-parchment/40 mt-0.5">
              {character.experience}/{expToNextLevel} XP
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <StatBar
          label="Health"
          current={character.stats.health}
          max={character.stats.maxHealth}
          color="text-blood"
          icon="❤️"
        />
        <StatBar
          label="Mana"
          current={character.stats.mana}
          max={character.stats.maxMana}
          color="text-mystic-light"
          icon="💎"
        />

        {/* Core stats */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <StatNumber label="ATK" value={character.stats.damage} icon="⚔️" />
          <StatNumber label="DEF" value={character.stats.defense} icon="🛡️" />
          <StatNumber label="SPD" value={character.stats.speed} icon="💨" />
          <StatNumber label="CRIT" value={Math.round(character.stats.critChance * 100)} icon="⚡" />
        </div>
      </div>

      {/* Skills */}
      {classData?.skills && (
        <div className="p-4 border-t border-gold/10">
          <h4 className="font-cinzel text-xs text-parchment/50 uppercase tracking-wider mb-3">Skills</h4>
          <div className="flex gap-2">
            {classData.skills.map((skill) => (
              <SkillButton
                key={skill.id}
                skill={skill}
                cooldown={character.skillCooldowns?.[skill.id] || 0}
                onUse={() => onSkillUse?.(skill.id)}
                disabled={character.stats.mana < skill.manaCost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {character.equipment && (
        <div className="p-4 border-t border-gold/10">
          <h4 className="font-cinzel text-xs text-parchment/50 uppercase tracking-wider mb-3">Equipment</h4>
          <div className="flex gap-2">
            <EquipmentSlot slot="weapon" item={character.equipment.weapon} />
            <EquipmentSlot slot="armor" item={character.equipment.armor} />
            <EquipmentSlot slot="accessory" item={character.equipment.accessory} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
