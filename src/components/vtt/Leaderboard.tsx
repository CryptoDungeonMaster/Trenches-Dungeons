"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CharacterClass } from "@/types/game";
import { CLASSES } from "@/data/classes";

interface LeaderboardEntry {
  rank: number;
  player_pubkey: string;
  score: number;
  floors_cleared: number;
  kills: number;
  gold: number;
  class: CharacterClass;
  created_at?: string;
}

interface LeaderboardProps {
  currentPlayerAddress?: string;
  onClose?: () => void;
  className?: string;
}

// Empty by default - no mock data

function RankBadge({ rank }: { rank: number }) {
  const badges: Record<number, { bg: string; text: string; icon: string }> = {
    1: { bg: "bg-gradient-to-br from-gold via-gold-pale to-gold-dark", text: "text-abyss", icon: "👑" },
    2: { bg: "bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400", text: "text-abyss", icon: "🥈" },
    3: { bg: "bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700", text: "text-abyss", icon: "🥉" },
  };

  const badge = badges[rank];

  if (badge) {
    return (
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold", badge.bg, badge.text)}>
        {badge.icon}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-cinzel text-sm text-parchment/60 bg-abyss/50 border border-parchment/10">
      #{rank}
    </div>
  );
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function LeaderboardRow({
  entry,
  isCurrentPlayer,
  index,
}: {
  entry: LeaderboardEntry;
  isCurrentPlayer: boolean;
  index: number;
}) {
  const classData = CLASSES[entry.class];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg transition-colors",
        isCurrentPlayer
          ? "bg-gold/10 border border-gold/30"
          : "bg-abyss/30 border border-transparent hover:border-parchment/10"
      )}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Class icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: classData?.color + "30" }}
      >
        {classData?.icon || "⚔️"}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-cinzel text-sm truncate", isCurrentPlayer ? "text-gold" : "text-parchment")}>
            {formatAddress(entry.player_pubkey)}
          </span>
          {isCurrentPlayer && (
            <span className="text-[10px] text-gold bg-gold/20 px-1.5 py-0.5 rounded">YOU</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-parchment/50 font-crimson mt-0.5">
          <span>🏰 {entry.floors_cleared} floors</span>
          <span>⚔️ {entry.kills} kills</span>
          <span>💰 {entry.gold}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={cn("font-cinzel text-lg font-bold", entry.rank <= 3 ? "text-gold" : "text-parchment")}>
          {entry.score.toLocaleString()}
        </p>
        {entry.created_at && (
          <p className="text-[10px] text-parchment/40">
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Leaderboard({
  currentPlayerAddress,
  onClose,
  className,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<CharacterClass | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (characterClass?: CharacterClass | "all") => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (characterClass && characterClass !== "all") {
        params.set("class", characterClass);
      }

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError("Unable to load leaderboard");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchLeaderboard(filter === "all" ? undefined : filter);
  }, [filter, fetchLeaderboard]);

  const filteredEntries =
    filter === "all" ? entries : entries.filter((e) => e.class === filter);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
        "rounded-xl border-2 border-gold/20 shadow-candle-lg",
        "overflow-hidden max-w-2xl w-full",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cinzel text-2xl text-gold font-bold">🏆 Leaderboard</h2>
            <p className="font-crimson text-parchment/60 text-sm mt-1">
              The bravest adventurers who conquered the trenches
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-abyss/50 border border-parchment/10 flex items-center justify-center text-parchment/60 hover:text-parchment hover:border-parchment/30 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-cinzel uppercase tracking-wider transition-all",
              filter === "all"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-abyss/50 text-parchment/50 border border-transparent hover:border-parchment/20"
            )}
          >
            All
          </button>
          {Object.values(CLASSES).map((classData) => (
            <button
              key={classData.id}
              onClick={() => setFilter(classData.id)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-cinzel transition-all flex items-center gap-1",
                filter === classData.id
                  ? "text-gold border"
                  : "text-parchment/50 border border-transparent hover:border-parchment/20"
              )}
              style={{
                backgroundColor: filter === classData.id ? classData.color + "20" : undefined,
                borderColor: filter === classData.id ? classData.color + "60" : undefined,
              }}
            >
              <span>{classData.icon}</span>
              <span className="hidden sm:inline">{classData.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-blood/10 text-blood text-sm font-crimson text-center">
          {error}
        </div>
      )}

      {/* Leaderboard list */}
      <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
            >
              ⚔️
            </motion.div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-parchment/40 font-crimson">
            <p className="text-4xl mb-2">🏰</p>
            <p>No legends have emerged yet...</p>
            <p className="text-sm">Be the first to conquer the trenches!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <LeaderboardRow
                key={`${entry.player_pubkey}-${entry.rank}`}
                entry={entry}
                isCurrentPlayer={entry.player_pubkey === currentPlayerAddress}
                index={index}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gold/10 bg-abyss/50">
        <div className="flex items-center justify-between text-xs text-parchment/40">
          <button
            onClick={() => fetchLeaderboard(filter === "all" ? undefined : filter)}
            className="font-crimson hover:text-parchment transition-colors"
          >
            🔄 Refresh
          </button>
          <span className="font-cinzel">Season 1</span>
        </div>
      </div>
    </motion.div>
  );
}
