"use client";

import { useState, useCallback, useEffect } from "react";
import { CharacterClass } from "@/types/game";
import { CLASSES } from "@/data/classes";

export interface GameCharacter {
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
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

export interface GameProgress {
  sessionId: string | null;
  floor: number;
  score: number;
  gold: number;
  enemiesDefeated: number;
  startTime: number;
  isDemo: boolean;
}

interface GameState {
  character: GameCharacter | null;
  progress: GameProgress;
  inventory: string[]; // item IDs
}

const STORAGE_KEY = "td_game_state";

export function useGameState() {
  const [state, setState] = useState<GameState>({
    character: null,
    progress: {
      sessionId: null,
      floor: 1,
      score: 0,
      gold: 0,
      enemiesDefeated: 0,
      startTime: Date.now(),
      isDemo: false,
    },
    inventory: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error("Failed to load game state:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (state.character) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Create character from class selection
  const createCharacter = useCallback((name: string, characterClass: CharacterClass) => {
    const classData = CLASSES[characterClass];
    if (!classData) return;

    const character: GameCharacter = {
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      health: classData.baseStats.health,
      maxHealth: classData.baseStats.health,
      mana: 50,
      maxMana: 50,
      damage: classData.baseStats.damage,
      defense: classData.baseStats.defense,
      speed: classData.baseStats.speed,
      critChance: 0.1,
      skillCooldowns: {},
    };

    setState((prev) => ({
      ...prev,
      character,
      progress: {
        ...prev.progress,
        floor: 1,
        score: 0,
        gold: 0,
        enemiesDefeated: 0,
        startTime: Date.now(),
      },
    }));

    return character;
  }, []);

  // Start a new session
  const startSession = useCallback((sessionId: string, isDemo: boolean = false) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        sessionId,
        isDemo,
        startTime: Date.now(),
      },
    }));
  }, []);

  // Update character stats
  const updateCharacter = useCallback((updates: Partial<GameCharacter>) => {
    setState((prev) => ({
      ...prev,
      character: prev.character ? { ...prev.character, ...updates } : null,
    }));
  }, []);

  // Update progress
  const updateProgress = useCallback((updates: Partial<GameProgress>) => {
    setState((prev) => ({
      ...prev,
      progress: { ...prev.progress, ...updates },
    }));
  }, []);

  // Add score
  const addScore = useCallback((points: number) => {
    setState((prev) => ({
      ...prev,
      progress: { ...prev.progress, score: prev.progress.score + points },
    }));
  }, []);

  // Add gold
  const addGold = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      progress: { ...prev.progress, gold: prev.progress.gold + amount },
    }));
  }, []);

  // Increment enemies defeated
  const enemyDefeated = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progress: { ...prev.progress, enemiesDefeated: prev.progress.enemiesDefeated + 1 },
    }));
  }, []);

  // Add item to inventory
  const addItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      inventory: [...prev.inventory, itemId],
    }));
  }, []);

  // Clear game state
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      character: null,
      progress: {
        sessionId: null,
        floor: 1,
        score: 0,
        gold: 0,
        enemiesDefeated: 0,
        startTime: Date.now(),
        isDemo: false,
      },
      inventory: [],
    });
  }, []);

  // Get play time in seconds
  const getPlayTime = useCallback(() => {
    return Math.floor((Date.now() - state.progress.startTime) / 1000);
  }, [state.progress.startTime]);

  return {
    character: state.character,
    progress: state.progress,
    inventory: state.inventory,
    createCharacter,
    startSession,
    updateCharacter,
    updateProgress,
    addScore,
    addGold,
    enemyDefeated,
    addItem,
    clearState,
    getPlayTime,
    hasCharacter: !!state.character,
  };
}
