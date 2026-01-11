/**
 * Character Classes - Unique playstyles with distinct abilities
 */

import { CharacterClass } from "@/types/game";

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  manaCost: number;
  cooldown: number;
  effect: {
    type: "damage" | "heal" | "buff" | "debuff" | "utility";
    value: number;
    duration?: number;
    target?: "self" | "enemy" | "all_enemies";
  };
  unlockLevel?: number;
}

export interface ClassData {
  id: CharacterClass;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseStats: {
    health: number;
    mana: number;
    damage: number;
    defense: number;
    speed: number;
    critChance: number;
  };
  statGrowth: {
    health: number;
    mana: number;
    damage: number;
    defense: number;
  };
  skills: Skill[];
  passives: {
    name: string;
    description: string;
    effect: string;
  }[];
  playstyle: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// ============================================
// WARRIOR
// ============================================

const WARRIOR: ClassData = {
  id: "warrior",
  name: "Warrior",
  description: "A stalwart fighter who excels in close combat. Warriors combine raw strength with battlefield tactics to overwhelm their foes.",
  icon: "⚔️",
  color: "#CD7F32", // Bronze
  baseStats: {
    health: 120,
    mana: 30,
    damage: 18,
    defense: 10,
    speed: 5,
    critChance: 0.1,
  },
  statGrowth: {
    health: 15,
    mana: 3,
    damage: 3,
    defense: 2,
  },
  skills: [
    {
      id: "warrior_strike",
      name: "Power Strike",
      description: "A devastating blow that deals massive damage.",
      icon: "💥",
      manaCost: 8,
      cooldown: 2,
      effect: { type: "damage", value: 35, target: "enemy" },
    },
    {
      id: "warrior_fortify",
      name: "Fortify",
      description: "Brace for impact, reducing incoming damage temporarily.",
      icon: "🛡️",
      manaCost: 5,
      cooldown: 3,
      effect: { type: "buff", value: 50, duration: 2 }, // 50% damage reduction
    },
    {
      id: "warrior_rally",
      name: "Battle Cry",
      description: "Rallying cry that heals and boosts your next attack.",
      icon: "📯",
      manaCost: 10,
      cooldown: 4,
      effect: { type: "heal", value: 20 },
      unlockLevel: 3,
    },
    {
      id: "warrior_cleave",
      name: "Cleave",
      description: "Wide swing that damages all enemies.",
      icon: "🌀",
      manaCost: 15,
      cooldown: 4,
      effect: { type: "damage", value: 25, target: "all_enemies" },
      unlockLevel: 5,
    },
    {
      id: "warrior_execute",
      name: "Executioner's Strike",
      description: "Devastating finisher that deals bonus damage to wounded foes.",
      icon: "⚡",
      manaCost: 20,
      cooldown: 5,
      effect: { type: "damage", value: 50, target: "enemy" },
      unlockLevel: 8,
    },
  ],
  passives: [
    {
      name: "Battle Hardened",
      description: "+10% max health",
      effect: "health_boost",
    },
    {
      name: "Second Wind",
      description: "Heal 10% HP when dropping below 25%",
      effect: "emergency_heal",
    },
    {
      name: "Intimidating Presence",
      description: "Enemies deal 5% less damage",
      effect: "enemy_debuff",
    },
  ],
  playstyle: "Frontline tank that absorbs damage and delivers powerful blows. Best for players who prefer straightforward combat.",
  difficulty: "Easy",
};

// ============================================
// MAGE
// ============================================

const MAGE: ClassData = {
  id: "mage",
  name: "Mage",
  description: "A master of arcane arts who wields devastating spells. Mages sacrifice durability for raw magical power.",
  icon: "🔮",
  color: "#9B30FF", // Purple
  baseStats: {
    health: 70,
    mana: 80,
    damage: 12,
    defense: 4,
    speed: 6,
    critChance: 0.15,
  },
  statGrowth: {
    health: 8,
    mana: 10,
    damage: 4,
    defense: 1,
  },
  skills: [
    {
      id: "mage_fireball",
      name: "Fireball",
      description: "Hurl a ball of fire at your enemy.",
      icon: "🔥",
      manaCost: 10,
      cooldown: 1,
      effect: { type: "damage", value: 40, target: "enemy" },
    },
    {
      id: "mage_heal",
      name: "Arcane Mending",
      description: "Channel healing energies to restore health.",
      icon: "✨",
      manaCost: 15,
      cooldown: 3,
      effect: { type: "heal", value: 35 },
    },
    {
      id: "mage_frost",
      name: "Frost Nova",
      description: "Blast of cold that damages and slows enemies.",
      icon: "❄️",
      manaCost: 12,
      cooldown: 2,
      effect: { type: "damage", value: 30, target: "all_enemies" },
      unlockLevel: 3,
    },
    {
      id: "mage_barrier",
      name: "Arcane Barrier",
      description: "Conjure a magical shield that absorbs damage.",
      icon: "🔰",
      manaCost: 20,
      cooldown: 4,
      effect: { type: "buff", value: 40, duration: 3 },
      unlockLevel: 5,
    },
    {
      id: "mage_meteor",
      name: "Meteor Strike",
      description: "Call down destruction from the heavens.",
      icon: "☄️",
      manaCost: 35,
      cooldown: 6,
      effect: { type: "damage", value: 80, target: "enemy" },
      unlockLevel: 8,
    },
  ],
  passives: [
    {
      name: "Mana Surge",
      description: "+20% max mana",
      effect: "mana_boost",
    },
    {
      name: "Spell Mastery",
      description: "10% chance to not consume mana",
      effect: "free_cast",
    },
    {
      name: "Arcane Knowledge",
      description: "Detect magical traps and secrets",
      effect: "detect_magic",
    },
  ],
  playstyle: "Glass cannon spellcaster with powerful AoE and healing. Requires careful mana management and positioning.",
  difficulty: "Medium",
};

// ============================================
// ROGUE
// ============================================

const ROGUE: ClassData = {
  id: "rogue",
  name: "Rogue",
  description: "A cunning trickster who strikes from the shadows. Rogues rely on speed, critical hits, and dirty tactics.",
  icon: "🗡️",
  color: "#2F4F4F", // Dark Slate Gray
  baseStats: {
    health: 85,
    mana: 50,
    damage: 15,
    defense: 5,
    speed: 10,
    critChance: 0.25,
  },
  statGrowth: {
    health: 10,
    mana: 5,
    damage: 4,
    defense: 1,
  },
  skills: [
    {
      id: "rogue_backstab",
      name: "Backstab",
      description: "Strike from the shadows for critical damage.",
      icon: "🔪",
      manaCost: 8,
      cooldown: 2,
      effect: { type: "damage", value: 45, target: "enemy" },
    },
    {
      id: "rogue_evasion",
      name: "Evasion",
      description: "Dodge the next attack completely.",
      icon: "💨",
      manaCost: 10,
      cooldown: 3,
      effect: { type: "buff", value: 100, duration: 1 },
    },
    {
      id: "rogue_poison",
      name: "Envenom",
      description: "Coat your blade with deadly poison.",
      icon: "☠️",
      manaCost: 12,
      cooldown: 3,
      effect: { type: "debuff", value: 8, duration: 3, target: "enemy" },
      unlockLevel: 3,
    },
    {
      id: "rogue_smoke",
      name: "Smoke Bomb",
      description: "Disorient enemies and gain a free strike.",
      icon: "💣",
      manaCost: 15,
      cooldown: 4,
      effect: { type: "utility", value: 20 },
      unlockLevel: 5,
    },
    {
      id: "rogue_execute",
      name: "Assassinate",
      description: "Fatal strike that ignores armor.",
      icon: "💀",
      manaCost: 25,
      cooldown: 5,
      effect: { type: "damage", value: 60, target: "enemy" },
      unlockLevel: 8,
    },
  ],
  passives: [
    {
      name: "Shadow Step",
      description: "+25% evasion chance",
      effect: "evasion_boost",
    },
    {
      name: "Opportunist",
      description: "+15% critical hit damage",
      effect: "crit_damage",
    },
    {
      name: "Thieves' Cant",
      description: "Find hidden treasures and passages",
      effect: "treasure_finder",
    },
  ],
  playstyle: "High-risk, high-reward damage dealer. Excels at burst damage and avoiding attacks, but punished for mistakes.",
  difficulty: "Hard",
};

// ============================================
// EXPORT
// ============================================

export const CLASSES: Record<CharacterClass, ClassData> = {
  warrior: WARRIOR,
  mage: MAGE,
  rogue: ROGUE,
};

export const CLASS_LIST = Object.values(CLASSES);

/**
 * Get starting equipment for a class
 */
export function getStartingEquipment(characterClass: CharacterClass): string[] {
  switch (characterClass) {
    case "warrior":
      return ["rusty_sword", "leather_vest"];
    case "mage":
      return ["wooden_staff", "cloth_robe"];
    case "rogue":
      return ["rusty_dagger", "leather_vest"];
    default:
      return ["rusty_sword"];
  }
}

/**
 * Calculate stats at a given level
 */
export function calculateStatsAtLevel(
  characterClass: CharacterClass,
  level: number
): ClassData["baseStats"] {
  const classData = CLASSES[characterClass];
  const levelBonus = level - 1;

  return {
    health: classData.baseStats.health + classData.statGrowth.health * levelBonus,
    mana: classData.baseStats.mana + classData.statGrowth.mana * levelBonus,
    damage: classData.baseStats.damage + classData.statGrowth.damage * levelBonus,
    defense: classData.baseStats.defense + classData.statGrowth.defense * levelBonus,
    speed: classData.baseStats.speed,
    critChance: classData.baseStats.critChance,
  };
}

/**
 * Get available skills for a class at a given level
 */
export function getAvailableSkills(characterClass: CharacterClass, level: number): Skill[] {
  const classData = CLASSES[characterClass];
  return classData.skills.filter((skill) => (skill.unlockLevel || 1) <= level);
}
