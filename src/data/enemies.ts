/**
 * Enemies Data - Diverse creatures with unique traits and abilities
 */

export interface EnemyTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number; // 1-5, determines base power and loot quality
  stats: {
    health: number;
    damage: number;
    defense: number;
    speed: number;
  };
  abilities?: string[];
  weakness?: string;
  lootTable?: {
    gold: { min: number; max: number };
    itemChance: number;
    items?: string[];
  };
}

// ============================================
// TIER 1 - COMMON FODDER (Floor 1)
// ============================================

const TIER_1_ENEMIES: EnemyTemplate[] = [
  {
    id: "goblin_scrapper",
    name: "Goblin Scrapper",
    description: "A small, vicious creature armed with rusty weapons.",
    icon: "👺",
    tier: 1,
    stats: { health: 25, damage: 8, defense: 2, speed: 6 },
    abilities: ["Dirty Fighting"],
    weakness: "light",
    lootTable: { gold: { min: 5, max: 15 }, itemChance: 0.1, items: ["rusty_dagger", "goblin_ear"] },
  },
  {
    id: "cave_rat",
    name: "Giant Cave Rat",
    description: "A diseased rodent the size of a dog.",
    icon: "🐀",
    tier: 1,
    stats: { health: 15, damage: 6, defense: 1, speed: 8 },
    abilities: ["Disease Bite"],
    weakness: "fire",
    lootTable: { gold: { min: 2, max: 8 }, itemChance: 0.05, items: ["rat_tail", "disease_gland"] },
  },
  {
    id: "skeleton_warrior",
    name: "Skeleton Warrior",
    description: "The animated bones of a fallen soldier.",
    icon: "💀",
    tier: 1,
    stats: { health: 20, damage: 10, defense: 3, speed: 4 },
    abilities: ["Bone Shield"],
    weakness: "holy",
    lootTable: { gold: { min: 8, max: 20 }, itemChance: 0.15, items: ["bone_shard", "ancient_coin"] },
  },
  {
    id: "slime",
    name: "Corrosive Slime",
    description: "A gelatinous blob that dissolves everything it touches.",
    icon: "🟢",
    tier: 1,
    stats: { health: 30, damage: 5, defense: 0, speed: 2 },
    abilities: ["Acid Touch", "Split"],
    weakness: "ice",
    lootTable: { gold: { min: 3, max: 10 }, itemChance: 0.2, items: ["slime_core", "acid_vial"] },
  },
  {
    id: "bat_swarm",
    name: "Bat Swarm",
    description: "Dozens of small bats acting as one predator.",
    icon: "🦇",
    tier: 1,
    stats: { health: 18, damage: 7, defense: 0, speed: 10 },
    abilities: ["Swarm", "Echolocation"],
    weakness: "area_attacks",
    lootTable: { gold: { min: 4, max: 12 }, itemChance: 0.08, items: ["bat_wing", "guano"] },
  },
];

// ============================================
// TIER 2 - DANGEROUS CREATURES (Floor 1-2)
// ============================================

const TIER_2_ENEMIES: EnemyTemplate[] = [
  {
    id: "orc_berserker",
    name: "Orc Berserker",
    description: "A muscular greenskin lost in battle rage.",
    icon: "👹",
    tier: 2,
    stats: { health: 45, damage: 15, defense: 4, speed: 5 },
    abilities: ["Rage", "Reckless Attack"],
    weakness: "kiting",
    lootTable: { gold: { min: 20, max: 40 }, itemChance: 0.2, items: ["orc_tusk", "crude_axe"] },
  },
  {
    id: "shadow_stalker",
    name: "Shadow Stalker",
    description: "A creature of pure darkness that moves between shadows.",
    icon: "👤",
    tier: 2,
    stats: { health: 30, damage: 18, defense: 2, speed: 9 },
    abilities: ["Ambush", "Shadow Step"],
    weakness: "light",
    lootTable: { gold: { min: 15, max: 35 }, itemChance: 0.25, items: ["shadow_essence", "dark_cloak"] },
  },
  {
    id: "animated_armor",
    name: "Animated Armor",
    description: "A suit of armor brought to life by dark magic.",
    icon: "🛡️",
    tier: 2,
    stats: { health: 50, damage: 12, defense: 8, speed: 3 },
    abilities: ["Heavy Armor", "Unstoppable"],
    weakness: "lightning",
    lootTable: { gold: { min: 25, max: 50 }, itemChance: 0.3, items: ["armor_scrap", "enchanted_visor"] },
  },
  {
    id: "hobgoblin_captain",
    name: "Hobgoblin Captain",
    description: "A disciplined goblin leader, far more dangerous than its kin.",
    icon: "⚔️",
    tier: 2,
    stats: { health: 40, damage: 14, defense: 5, speed: 6 },
    abilities: ["Rally", "Shield Bash"],
    lootTable: { gold: { min: 30, max: 55 }, itemChance: 0.25, items: ["captain_badge", "iron_sword"] },
  },
  {
    id: "venomous_spider",
    name: "Giant Venomous Spider",
    description: "A massive arachnid with paralytic venom.",
    icon: "🕷️",
    tier: 2,
    stats: { health: 35, damage: 12, defense: 3, speed: 7 },
    abilities: ["Poison Bite", "Web Trap"],
    weakness: "fire",
    lootTable: { gold: { min: 15, max: 30 }, itemChance: 0.3, items: ["spider_silk", "venom_sac"] },
  },
];

// ============================================
// TIER 3 - ELITE THREATS (Floor 2)
// ============================================

const TIER_3_ENEMIES: EnemyTemplate[] = [
  {
    id: "wraith",
    name: "Vengeful Wraith",
    description: "The tortured spirit of one who died in rage.",
    icon: "👻",
    tier: 3,
    stats: { health: 55, damage: 20, defense: 1, speed: 8 },
    abilities: ["Incorporeal", "Life Drain", "Terrifying Wail"],
    weakness: "holy",
    lootTable: { gold: { min: 40, max: 70 }, itemChance: 0.35, items: ["ectoplasm", "soul_fragment"] },
  },
  {
    id: "mimic",
    name: "Hungry Mimic",
    description: "A shapeshifter that disguises itself as treasure.",
    icon: "📦",
    tier: 3,
    stats: { health: 65, damage: 18, defense: 6, speed: 5 },
    abilities: ["Surprise Attack", "Sticky Tongue", "Treasure Form"],
    lootTable: { gold: { min: 60, max: 100 }, itemChance: 0.5, items: ["mimic_tooth", "false_gold"] },
  },
  {
    id: "cultist_warlock",
    name: "Cultist Warlock",
    description: "A dark magic user serving unknown masters.",
    icon: "🧙",
    tier: 3,
    stats: { health: 40, damage: 25, defense: 3, speed: 6 },
    abilities: ["Dark Bolt", "Curse", "Summon Minion"],
    weakness: "disruption",
    lootTable: { gold: { min: 35, max: 65 }, itemChance: 0.4, items: ["dark_tome", "ritual_dagger"] },
  },
  {
    id: "troll",
    name: "Cave Troll",
    description: "A regenerating brute of immense size.",
    icon: "🧌",
    tier: 3,
    stats: { health: 80, damage: 22, defense: 5, speed: 4 },
    abilities: ["Regeneration", "Boulder Throw", "Ground Slam"],
    weakness: "fire",
    lootTable: { gold: { min: 45, max: 80 }, itemChance: 0.3, items: ["troll_blood", "giant_club"] },
  },
  {
    id: "dark_knight",
    name: "Fallen Knight",
    description: "A once-noble warrior corrupted by the trenches.",
    icon: "🖤",
    tier: 3,
    stats: { health: 70, damage: 20, defense: 8, speed: 5 },
    abilities: ["Dark Strike", "Unholy Shield", "Draining Blow"],
    weakness: "holy",
    lootTable: { gold: { min: 50, max: 90 }, itemChance: 0.45, items: ["dark_blade", "fallen_helm"] },
  },
];

// ============================================
// TIER 4 - MINI BOSSES (Floor 2-3)
// ============================================

const TIER_4_ENEMIES: EnemyTemplate[] = [
  {
    id: "necromancer",
    name: "Necromancer Ascendant",
    description: "A master of death magic who commands the undead.",
    icon: "☠️",
    tier: 4,
    stats: { health: 90, damage: 28, defense: 4, speed: 5 },
    abilities: ["Raise Dead", "Death Bolt", "Soul Cage", "Corpse Explosion"],
    weakness: "holy",
    lootTable: { gold: { min: 80, max: 150 }, itemChance: 0.6, items: ["necronomicon", "soul_crystal"] },
  },
  {
    id: "basilisk",
    name: "Ancient Basilisk",
    description: "A serpent whose gaze turns flesh to stone.",
    icon: "🐍",
    tier: 4,
    stats: { health: 100, damage: 24, defense: 6, speed: 6 },
    abilities: ["Petrifying Gaze", "Venomous Bite", "Coil", "Stone Breath"],
    weakness: "mirrors",
    lootTable: { gold: { min: 70, max: 130 }, itemChance: 0.55, items: ["basilisk_eye", "stone_scale"] },
  },
  {
    id: "demon_herald",
    name: "Demon Herald",
    description: "An emissary of the lower planes.",
    icon: "😈",
    tier: 4,
    stats: { health: 85, damage: 30, defense: 5, speed: 7 },
    abilities: ["Hellfire", "Demonic Roar", "Summon Imps", "Corruption"],
    weakness: "holy",
    lootTable: { gold: { min: 90, max: 160 }, itemChance: 0.5, items: ["demon_horn", "infernal_gem"] },
  },
];

// ============================================
// TIER 5 - BOSSES (Floor 3)
// ============================================

const TIER_5_ENEMIES: EnemyTemplate[] = [
  {
    id: "the_trench_lord",
    name: "The Trench Lord",
    description: "An ancient being that has ruled these depths for millennia.",
    icon: "👑",
    tier: 5,
    stats: { health: 200, damage: 35, defense: 10, speed: 6 },
    abilities: [
      "Sovereign's Decree",
      "Trench Quake",
      "Summon Guardians",
      "Dark Majesty",
      "Ancient Fury",
    ],
    weakness: "pride",
    lootTable: { gold: { min: 200, max: 500 }, itemChance: 1.0, items: ["crown_of_depths", "trench_lords_bane"] },
  },
  {
    id: "the_forgotten_one",
    name: "The Forgotten One",
    description: "Something that was sealed away for good reason.",
    icon: "👁️",
    tier: 5,
    stats: { health: 180, damage: 40, defense: 8, speed: 8 },
    abilities: [
      "Reality Warp",
      "Madness Gaze",
      "Void Touch",
      "Unspeakable Horror",
      "Memory Drain",
    ],
    lootTable: { gold: { min: 250, max: 600 }, itemChance: 1.0, items: ["void_essence", "sanity_shard"] },
  },
];

// ============================================
// COMBINED EXPORTS
// ============================================

export const ENEMIES: Record<string, EnemyTemplate> = {
  // Tier 1
  goblin_scrapper: TIER_1_ENEMIES[0],
  cave_rat: TIER_1_ENEMIES[1],
  skeleton_warrior: TIER_1_ENEMIES[2],
  slime: TIER_1_ENEMIES[3],
  bat_swarm: TIER_1_ENEMIES[4],
  // Tier 2
  orc_berserker: TIER_2_ENEMIES[0],
  shadow_stalker: TIER_2_ENEMIES[1],
  animated_armor: TIER_2_ENEMIES[2],
  hobgoblin_captain: TIER_2_ENEMIES[3],
  venomous_spider: TIER_2_ENEMIES[4],
  // Tier 3
  wraith: TIER_3_ENEMIES[0],
  mimic: TIER_3_ENEMIES[1],
  cultist_warlock: TIER_3_ENEMIES[2],
  troll: TIER_3_ENEMIES[3],
  dark_knight: TIER_3_ENEMIES[4],
  // Tier 4
  necromancer: TIER_4_ENEMIES[0],
  basilisk: TIER_4_ENEMIES[1],
  demon_herald: TIER_4_ENEMIES[2],
  // Tier 5
  the_trench_lord: TIER_5_ENEMIES[0],
  the_forgotten_one: TIER_5_ENEMIES[1],
};

export const ALL_ENEMIES = [
  ...TIER_1_ENEMIES,
  ...TIER_2_ENEMIES,
  ...TIER_3_ENEMIES,
  ...TIER_4_ENEMIES,
  ...TIER_5_ENEMIES,
];

/**
 * Get a random enemy appropriate for the given tier
 */
export function getRandomEnemy(maxTier: number = 2): EnemyTemplate {
  const validEnemies = ALL_ENEMIES.filter((e) => e.tier <= maxTier);
  
  // Weight towards lower tiers
  const weighted: EnemyTemplate[] = [];
  validEnemies.forEach((enemy) => {
    const weight = maxTier - enemy.tier + 1;
    for (let i = 0; i < weight; i++) {
      weighted.push(enemy);
    }
  });
  
  return weighted[Math.floor(Math.random() * weighted.length)] || TIER_1_ENEMIES[0];
}

/**
 * Get enemies by tier
 */
export function getEnemiesByTier(tier: number): EnemyTemplate[] {
  switch (tier) {
    case 1:
      return TIER_1_ENEMIES;
    case 2:
      return TIER_2_ENEMIES;
    case 3:
      return TIER_3_ENEMIES;
    case 4:
      return TIER_4_ENEMIES;
    case 5:
      return TIER_5_ENEMIES;
    default:
      return TIER_1_ENEMIES;
  }
}

/**
 * Get a boss for the given floor
 */
export function getBossForFloor(floor: number): EnemyTemplate {
  if (floor >= 3) {
    return TIER_5_ENEMIES[Math.floor(Math.random() * TIER_5_ENEMIES.length)];
  }
  return TIER_4_ENEMIES[Math.floor(Math.random() * TIER_4_ENEMIES.length)];
}
