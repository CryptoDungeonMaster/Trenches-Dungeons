import { getAllSettings, setSetting } from "./db-supabase";

export interface GameSettings {
  entryFee: bigint; // in base units
  rewardAmount: bigint; // in base units
  treasuryPublicKey: string;
  difficulty: "easy" | "normal" | "hard";
  payoutEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  entryFee: BigInt(1000000), // 1 token with 6 decimals
  rewardAmount: BigInt(500000), // 0.5 token with 6 decimals
  treasuryPublicKey: "4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA",
  difficulty: "normal",
  payoutEnabled: false,
};

/**
 * Get all game settings
 */
export async function getGameSettings(): Promise<GameSettings> {
  const settingsMap = await getAllSettings();

  return {
    entryFee: BigInt(settingsMap.get("entryFee") || DEFAULT_SETTINGS.entryFee.toString()),
    rewardAmount: BigInt(settingsMap.get("rewardAmount") || DEFAULT_SETTINGS.rewardAmount.toString()),
    treasuryPublicKey: settingsMap.get("treasuryPublicKey") || DEFAULT_SETTINGS.treasuryPublicKey,
    difficulty: (settingsMap.get("difficulty") as GameSettings["difficulty"]) || DEFAULT_SETTINGS.difficulty,
    payoutEnabled: settingsMap.get("payoutEnabled") === "true",
  };
}

/**
 * Update game settings
 */
export async function updateGameSettings(newSettings: Partial<GameSettings>): Promise<void> {
  const updates: Promise<boolean>[] = [];

  if (newSettings.entryFee !== undefined) {
    updates.push(setSetting("entryFee", newSettings.entryFee.toString()));
  }
  if (newSettings.rewardAmount !== undefined) {
    updates.push(setSetting("rewardAmount", newSettings.rewardAmount.toString()));
  }
  if (newSettings.treasuryPublicKey !== undefined) {
    updates.push(setSetting("treasuryPublicKey", newSettings.treasuryPublicKey));
  }
  if (newSettings.difficulty !== undefined) {
    updates.push(setSetting("difficulty", newSettings.difficulty));
  }
  if (newSettings.payoutEnabled !== undefined) {
    updates.push(setSetting("payoutEnabled", newSettings.payoutEnabled.toString()));
  }

  await Promise.all(updates);
}
