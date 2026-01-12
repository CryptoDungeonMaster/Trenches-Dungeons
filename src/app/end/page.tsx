"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// ============================================
// EMBER PARTICLES
// ============================================
function EmberParticles({ color = "ember" }: { color?: "ember" | "gold" }) {
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    setEmbers(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        size: 2 + Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ x: `${e.x}%`, y: "105%", opacity: 0 }}
          animate={{ y: "-5%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 5 + Math.random() * 3, delay: e.delay, repeat: Infinity }}
          className="absolute rounded-full"
          style={{
            width: e.size,
            height: e.size,
            background: color === "gold" ? "var(--gold-1)" : "var(--ember)",
            boxShadow: `0 0 ${e.size * 2}px ${color === "gold" ? "var(--gold-1)" : "var(--ember)"}`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// STAT PLAQUE
// ============================================
function StatPlaque({ label, value, icon, delay }: { label: string; value: string | number; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-4 py-3 td-panel"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="td-label">{label}</p>
        <p className="font-display text-lg text-gold1">{value}</p>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN END CONTENT
// ============================================
function EndContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const result = searchParams.get("result") || "defeat";
  const score = parseInt(searchParams.get("score") || "0", 10);
  const gold = parseInt(searchParams.get("gold") || "0", 10);
  const floors = parseInt(searchParams.get("floors") || "1", 10);
  const kills = parseInt(searchParams.get("kills") || "0", 10);
  const characterClass = searchParams.get("class") || "warrior";
  const isDemo = searchParams.get("demo") === "true";

  const isVictory = result === "victory";
  const [showStats, setShowStats] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Submit to leaderboard for non-demo games
  useEffect(() => {
    if (isDemo || submitted) return;

    const submitToLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerPubkey: localStorage.getItem("td_player") || "anonymous",
            score,
            gold,
            floorsCleared: floors,
            kills,
            characterClass,
          }),
        });

        if (res.ok) {
          console.log("[Leaderboard] Score submitted successfully");
          setSubmitted(true);
        }
      } catch (err) {
        console.error("[Leaderboard] Submit error:", err);
      }
    };

    submitToLeaderboard();
  }, [isDemo, submitted, score, gold, floors, kills, characterClass]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-bg0 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        {isVictory ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,207,138,0.12),transparent_60%)]" />
            <EmberParticles color="gold" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(179,23,42,0.1),transparent_60%)]" />
            <EmberParticles color="ember" />
          </>
        )}
        <div className="absolute inset-0 bg-soot" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-6"
        >
          {isVictory ? (
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl">
              👑
            </motion.div>
          ) : (
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-8xl grayscale">
              💀
            </motion.div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "font-display text-4xl sm:text-5xl font-black mb-4",
            isVictory ? "text-gold1 text-glow-gold" : "text-blood"
          )}
        >
          {isVictory ? "VICTORY!" : "DEFEAT"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-text1 font-flavor text-lg italic mb-8"
        >
          {isVictory
            ? "You have conquered the trenches and emerged victorious!"
            : "The darkness claims another soul..."}
        </motion.p>

        {/* Demo notice */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8 px-4 py-3 bg-arcane/20 border border-arcane/30 rounded-lg inline-block"
          >
            <p className="font-ui text-sm text-text1">
              🎮 Demo Mode — <span className="text-gold1">Connect wallet to earn real rewards!</span>
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-3">
                <StatPlaque label="Final Score" value={score.toLocaleString()} icon="🏆" delay={0.1} />
                <StatPlaque label="Gold Collected" value={gold.toLocaleString()} icon="💰" delay={0.2} />
                <StatPlaque label="Floors Cleared" value={floors} icon="🏰" delay={0.3} />
                <StatPlaque label="Enemies Slain" value={kills} icon="⚔️" delay={0.4} />
              </div>

              {isVictory && !isDemo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-5 td-panel-elevated td-rivets"
                >
                  <p className="font-display text-gold1 mb-2">🎁 Rewards Available</p>
                  <p className="font-ui text-xs text-text2 mb-4">Claim your TND tokens based on your performance!</p>
                  <button className="td-btn td-btn-primary">Claim Rewards</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => router.push(isDemo ? "/dungeon?demo=true" : "/dungeon")}
            className={cn("td-btn", isVictory ? "td-btn-primary" : "td-btn-danger")}
          >
            {isVictory ? "⚔️ Play Again" : "🔄 Try Again"}
          </button>
          <button onClick={() => router.push("/")} className="td-btn td-btn-ghost">
            ← Return Home
          </button>
        </motion.div>

        {/* Leaderboard prompt */}
        {!isDemo && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 text-xs text-text2 font-ui"
          >
            Your score has been recorded on the leaderboard
          </motion.p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-text2/40 text-xs font-ui">Trenches & Dragons © 2026</p>
      </div>
    </main>
  );
}

// ============================================
// LOADING
// ============================================
function EndLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg0">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-5xl mb-4">
          ⚔️
        </motion.div>
        <p className="text-text2 font-flavor">Tallying your glory...</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================
export default function EndPage() {
  return (
    <Suspense fallback={<EndLoading />}>
      <EndContent />
    </Suspense>
  );
}
