/**
 * ============================================
 * TRENCHES & DRAGONS - Core Game Types
 * Modular foundation for all game systems
 * ============================================
 */

// ============================================
// CHARACTER CLASSES
// ============================================
export type CharacterClass = "warrior" | "mage" | "rogue";

export interface ClassDefinition {
  id: CharacterClass;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseStats: {
    health: number;
    damage: number;
    defense: number;
    speed: number;
  };
  skills: SkillDefinition[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // turns
  manaCost: number;
  effect: SkillEffect;
}

export type SkillEffect = 
  | { type: "damage"; value: number; scaling: number }
  | { type: "heal"; value: number; scaling: number }
  | { type: "buff"; stat: keyof CharacterStats; value: number; duration: number }
  | { type: "debuff"; stat: keyof CharacterStats; value: number; duration: number }
  | { type: "aoe"; damage: number; radius: number };

// ============================================
// CHARACTER & STATS
// ============================================
export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  damage: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  stats: CharacterStats;
  equipment: EquipmentSlots;
  inventory: InventoryItem[];
  activeBuffs: ActiveBuff[];
  skillCooldowns: Record<string, number>;
  position: GridPosition;
}

export interface ActiveBuff {
  id: string;
  name: string;
  stat: keyof CharacterStats;
  value: number;
  remainingTurns: number;
  isDebuff: boolean;
}

// ============================================
// EQUIPMENT SYSTEM
// ============================================
export type EquipmentSlot = "weapon" | "armor" | "helmet" | "boots" | "accessory";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface EquipmentSlots {
  weapon: Equipment | null;
  armor: Equipment | null;
  helmet: Equipment | null;
  boots: Equipment | null;
  accessory: Equipment | null;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  icon: string;
  stats: Partial<CharacterStats>;
  specialEffect?: string;
  requiredLevel: number;
  requiredClass?: CharacterClass;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
}

export interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: ItemRarity;
  effect: ItemEffect;
  stackable: boolean;
  maxStack: number;
}

export type ItemEffect = 
  | { type: "heal"; value: number }
  | { type: "mana"; value: number }
  | { type: "buff"; stat: keyof CharacterStats; value: number; duration: number }
  | { type: "damage"; value: number };

// ============================================
// MAP & GRID SYSTEM (VTT-Style)
// ============================================
export interface GridPosition {
  x: number;
  y: number;
}

export interface MapTile {
  id: string;
  position: GridPosition;
  type: TileType;
  variant: number;
  isExplored: boolean;
  isVisible: boolean;
  entity: MapEntity | null;
  decoration: TileDecoration | null;
}

export type TileType = 
  | "floor" 
  | "wall" 
  | "door" 
  | "entrance" 
  | "exit" 
  | "trap" 
  | "treasure" 
  | "water" 
  | "lava" 
  | "void";

export interface TileDecoration {
  type: "bones" | "torch" | "barrel" | "crate" | "rubble" | "blood" | "moss" | "chains";
  variant: number;
}

export interface MapEntity {
  id: string;
  type: "player" | "enemy" | "npc" | "loot";
  entityId: string;
}

export interface DungeonMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: MapTile[][];
  rooms: Room[];
  currentRoom: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  bounds: { x: number; y: number; width: number; height: number };
  isCleared: boolean;
  enemies: Enemy[];
  loot: LootDrop[];
}

export type RoomType = 
  | "entrance" 
  | "combat" 
  | "treasure" 
  | "trap" 
  | "rest" 
  | "boss" 
  | "shop" 
  | "puzzle" 
  | "exit";

// ============================================
// ENEMIES
// ============================================
export interface Enemy {
  id: string;
  templateId: string;
  name: string;
  description: string;
  icon: string;
  stats: CharacterStats;
  position: GridPosition;
  lootTable: LootEntry[];
  experienceReward: number;
  goldReward: { min: number; max: number };
  abilities: EnemyAbility[];
}

export interface EnemyAbility {
  id: string;
  name: string;
  chance: number;
  effect: SkillEffect;
}

export interface LootEntry {
  itemId: string;
  dropChance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface LootDrop {
  id: string;
  items: { itemId: string; quantity: number }[];
  gold: number;
  position: GridPosition;
}

// ============================================
// COMBAT SYSTEM
// ============================================
export interface CombatState {
  isActive: boolean;
  turn: number;
  currentActor: string | null;
  turnOrder: CombatParticipant[];
  combatLog: CombatLogEntry[];
  phase: CombatPhase;
}

export interface CombatParticipant {
  id: string;
  type: "player" | "enemy";
  initiative: number;
  hasActed: boolean;
}

export type CombatPhase = "initiative" | "player_turn" | "enemy_turn" | "resolution" | "victory" | "defeat";

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: "attack" | "skill" | "item" | "buff" | "debuff" | "damage" | "heal" | "death" | "status";
  actor: string;
  target?: string;
  value?: number;
  message: string;
}

export type CombatAction = 
  | { type: "attack"; targetId: string }
  | { type: "skill"; skillId: string; targetId: string }
  | { type: "item"; itemId: string; targetId?: string }
  | { type: "move"; position: GridPosition }
  | { type: "defend" }
  | { type: "flee" };

// ============================================
// MULTIPLAYER / LEADERBOARDS
// ============================================
export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerAddress: string;
  playerName?: string;
  score: number;
  floorsCleared: number;
  enemiesDefeated: number;
  goldCollected: number;
  playTime: number; // seconds
  characterClass: CharacterClass;
  timestamp: string;
}

export interface PartyMember {
  id: string;
  address: string;
  name: string;
  character: Character;
  isReady: boolean;
  isLeader: boolean;
}

export interface Party {
  id: string;
  code: string;
  members: PartyMember[];
  maxSize: number;
  status: "lobby" | "in_dungeon" | "disbanded";
  settings: PartySettings;
}

export interface PartySettings {
  lootDistribution: "ffa" | "round_robin" | "need_greed";
  difficulty: "normal" | "hard" | "nightmare";
  allowMidJoin: boolean;
}

// ============================================
// GAME SESSION STATE
// ============================================
export interface GameSession {
  id: string;
  playerId: string;
  character: Character;
  dungeon: DungeonMap;
  combat: CombatState;
  score: number;
  gold: number;
  floor: number;
  turnCount: number;
  startedAt: string;
  seed: string;
  isDemo: boolean;
}

// ============================================
// UI STATE
// ============================================
export interface UIState {
  selectedTile: GridPosition | null;
  selectedSkill: string | null;
  selectedItem: string | null;
  hoveredEntity: string | null;
  showInventory: boolean;
  showCharacterSheet: boolean;
  showMap: boolean;
  showSettings: boolean;
  tooltipContent: TooltipContent | null;
}

export interface TooltipContent {
  type: "item" | "skill" | "enemy" | "tile";
  data: unknown;
  position: { x: number; y: number };
}
