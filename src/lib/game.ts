/**
 * Seeded Random Number Generator
 * Uses a simple xorshift algorithm for deterministic randomness
 */
export class SeededRNG {
  private state: number;

  constructor(seed: string) {
    // Convert seed string to a number
    this.state = this.hashString(seed);
    if (this.state === 0) this.state = 1; // Avoid zero state
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // xorshift32
    this.state ^= this.state << 13;
    this.state ^= this.state >>> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Roll a d20
   */
  rollD20(): number {
    return this.nextInt(1, 21);
  }

  /**
   * Roll dice (e.g., 2d6)
   */
  rollDice(count: number, sides: number): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.nextInt(1, sides + 1);
    }
    return total;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }
}

// Game types
export interface GameState {
  stage: number;
  health: number;
  maxHealth: number;
  gold: number;
  score: number;
  currentEncounter: Encounter | null;
  log: string[];
  isComplete: boolean;
  victory: boolean;
}

export interface Encounter {
  type: "combat" | "treasure" | "trap" | "rest";
  name: string;
  description: string;
  enemyHealth?: number;
  enemyMaxHealth?: number;
  enemyDamage?: number;
  treasureGold?: number;
  trapDamage?: number;
  healAmount?: number;
}

export type Choice = "left" | "right";
export type CombatAction = "attack" | "defend" | "escape";
export type LootChoice = "take" | "leave";

// Encounter templates
const ENEMIES = [
  { name: "Goblin Scout", health: 15, damage: 5 },
  { name: "Skeleton Warrior", health: 20, damage: 8 },
  { name: "Cave Spider", health: 12, damage: 6 },
  { name: "Orc Grunt", health: 25, damage: 10 },
  { name: "Dark Cultist", health: 18, damage: 7 },
  { name: "Ghoul", health: 22, damage: 9 },
  { name: "Bandit", health: 16, damage: 6 },
  { name: "Giant Rat", health: 10, damage: 4 },
];

const TREASURES = [
  { name: "Small Chest", gold: 50 },
  { name: "Gold Pile", gold: 75 },
  { name: "Ancient Coffer", gold: 100 },
  { name: "Jeweled Box", gold: 150 },
];

const TRAPS = [
  { name: "Spike Pit", damage: 10 },
  { name: "Poison Dart", damage: 8 },
  { name: "Falling Rocks", damage: 15 },
  { name: "Flame Jet", damage: 12 },
];

/**
 * Initialize a new game state
 */
export function initGameState(): GameState {
  return {
    stage: 0,
    health: 100,
    maxHealth: 100,
    gold: 0,
    score: 0,
    currentEncounter: null,
    log: ["You descend into the trenches..."],
    isComplete: false,
    victory: false,
  };
}

/**
 * Generate an encounter based on door choice and RNG
 */
export function generateEncounter(rng: SeededRNG, stage: number, choice: Choice): Encounter {
  // Door choice influences encounter type probability
  const roll = rng.next();
  const leftBias = choice === "left" ? 0.1 : -0.1;

  let encounterType: Encounter["type"];
  const adjustedRoll = roll + leftBias;

  if (adjustedRoll < 0.5) {
    encounterType = "combat";
  } else if (adjustedRoll < 0.7) {
    encounterType = "treasure";
  } else if (adjustedRoll < 0.85) {
    encounterType = "trap";
  } else {
    encounterType = "rest";
  }

  // Scale difficulty with stage
  const difficultyMultiplier = 1 + stage * 0.15;

  switch (encounterType) {
    case "combat": {
      const enemy = rng.pick(ENEMIES);
      return {
        type: "combat",
        name: enemy.name,
        description: `A ${enemy.name} blocks your path!`,
        enemyHealth: Math.floor(enemy.health * difficultyMultiplier),
        enemyMaxHealth: Math.floor(enemy.health * difficultyMultiplier),
        enemyDamage: Math.floor(enemy.damage * difficultyMultiplier),
      };
    }
    case "treasure": {
      const treasure = rng.pick(TREASURES);
      return {
        type: "treasure",
        name: treasure.name,
        description: `You discover a ${treasure.name}!`,
        treasureGold: Math.floor(treasure.gold * (1 + stage * 0.1)),
      };
    }
    case "trap": {
      const trap = rng.pick(TRAPS);
      return {
        type: "trap",
        name: trap.name,
        description: `You triggered a ${trap.name}!`,
        trapDamage: Math.floor(trap.damage * difficultyMultiplier),
      };
    }
    case "rest": {
      return {
        type: "rest",
        name: "Safe Haven",
        description: "You find a quiet corner to rest...",
        healAmount: 20 + stage * 5,
      };
    }
  }
}

/**
 * Process a combat action
 */
export function processCombatAction(
  state: GameState,
  action: CombatAction,
  rng: SeededRNG
): { newState: GameState; message: string } {
  if (!state.currentEncounter || state.currentEncounter.type !== "combat") {
    return { newState: state, message: "No combat encounter active" };
  }

  const encounter = state.currentEncounter;
  let message = "";
  const newState = { ...state };
  const newEncounter = { ...encounter };

  const playerRoll = rng.rollD20();
  const enemyRoll = rng.rollD20();

  switch (action) {
    case "attack": {
      // Player attacks
      const damage = rng.rollDice(2, 6) + Math.floor(playerRoll / 4);
      newEncounter.enemyHealth = (newEncounter.enemyHealth || 0) - damage;
      message = `You attack for ${damage} damage! (Rolled ${playerRoll})`;

      // Enemy counterattack if still alive
      if (newEncounter.enemyHealth! > 0) {
        const enemyDamage = Math.max(0, (newEncounter.enemyDamage || 0) - Math.floor(enemyRoll / 5));
        newState.health -= enemyDamage;
        message += ` The ${encounter.name} strikes back for ${enemyDamage} damage!`;
      } else {
        const goldReward = rng.nextInt(10, 30) + state.stage * 5;
        const scoreReward = 100 + state.stage * 25;
        newState.gold += goldReward;
        newState.score += scoreReward;
        message += ` The ${encounter.name} is defeated! +${goldReward} gold, +${scoreReward} score`;
        newState.currentEncounter = null;
      }
      break;
    }
    case "defend": {
      // Player defends - reduced incoming damage, small counterattack
      const counterDamage = rng.rollDice(1, 4);
      newEncounter.enemyHealth = (newEncounter.enemyHealth || 0) - counterDamage;
      message = `You brace yourself and counter for ${counterDamage} damage!`;

      // Reduced enemy attack
      const reducedDamage = Math.floor((newEncounter.enemyDamage || 0) * 0.3);
      newState.health -= Math.max(0, reducedDamage);
      message += ` Blocked most of the ${encounter.name}'s attack, taking only ${reducedDamage} damage.`;

      if (newEncounter.enemyHealth! <= 0) {
        const goldReward = rng.nextInt(10, 25) + state.stage * 5;
        const scoreReward = 75 + state.stage * 20;
        newState.gold += goldReward;
        newState.score += scoreReward;
        message += ` The ${encounter.name} falls! +${goldReward} gold, +${scoreReward} score`;
        newState.currentEncounter = null;
      }
      break;
    }
    case "escape": {
      // Try to escape - d20 roll
      if (playerRoll >= 12) {
        message = `You successfully flee from the ${encounter.name}! (Rolled ${playerRoll})`;
        newState.currentEncounter = null;
        newState.score += 25; // Small score for survival
      } else {
        const escapeDamage = Math.floor((newEncounter.enemyDamage || 0) * 1.2);
        newState.health -= escapeDamage;
        message = `Failed to escape! (Rolled ${playerRoll}) The ${encounter.name} strikes for ${escapeDamage} damage!`;
      }
      break;
    }
  }

  // Update encounter if still active
  if (newState.currentEncounter) {
    newState.currentEncounter = newEncounter;
  }

  // Check for player death
  if (newState.health <= 0) {
    newState.health = 0;
    newState.isComplete = true;
    newState.victory = false;
    message += " You have fallen in the trenches...";
  }

  newState.log = [...state.log, message];
  return { newState, message };
}

/**
 * Process trap damage
 */
export function processTrap(state: GameState): GameState {
  if (!state.currentEncounter || state.currentEncounter.type !== "trap") {
    return state;
  }

  const damage = state.currentEncounter.trapDamage || 0;
  const newHealth = Math.max(0, state.health - damage);
  const isComplete = newHealth <= 0;

  return {
    ...state,
    health: newHealth,
    isComplete,
    victory: false,
    currentEncounter: null,
    log: [...state.log, `The ${state.currentEncounter.name} deals ${damage} damage!`],
  };
}

/**
 * Process rest encounter
 */
export function processRest(state: GameState): GameState {
  if (!state.currentEncounter || state.currentEncounter.type !== "rest") {
    return state;
  }

  const healAmount = state.currentEncounter.healAmount || 0;
  const newHealth = Math.min(state.maxHealth, state.health + healAmount);
  const actualHeal = newHealth - state.health;

  return {
    ...state,
    health: newHealth,
    score: state.score + 50,
    currentEncounter: null,
    log: [...state.log, `You rest and recover ${actualHeal} health. +50 score`],
  };
}

/**
 * Process treasure loot choice
 */
export function processTreasure(state: GameState, choice: LootChoice): GameState {
  if (!state.currentEncounter || state.currentEncounter.type !== "treasure") {
    return state;
  }

  const gold = state.currentEncounter.treasureGold || 0;

  if (choice === "take") {
    return {
      ...state,
      gold: state.gold + gold,
      score: state.score + gold,
      currentEncounter: null,
      log: [...state.log, `You collect ${gold} gold from the ${state.currentEncounter.name}! +${gold} score`],
    };
  } else {
    return {
      ...state,
      score: state.score + 25, // Small bonus for caution
      currentEncounter: null,
      log: [...state.log, "You leave the treasure behind. Better safe than sorry. +25 score"],
    };
  }
}

/**
 * Check if the game should end (after N stages)
 */
export function checkVictory(state: GameState, totalStages: number = 5): GameState {
  if (state.stage >= totalStages && !state.currentEncounter) {
    return {
      ...state,
      isComplete: true,
      victory: true,
      score: state.score + state.health * 2 + state.gold, // Bonus for health and gold
      log: [...state.log, `Victory! You escaped the trenches with ${state.health} health and ${state.gold} gold!`],
    };
  }
  return state;
}

/**
 * Calculate final score
 */
export function calculateFinalScore(state: GameState): number {
  let score = state.score;

  // Bonuses
  if (state.victory) {
    score += 500; // Completion bonus
    score += state.health * 3; // Health bonus
    score += state.gold; // Gold bonus
  }

  return score;
}
