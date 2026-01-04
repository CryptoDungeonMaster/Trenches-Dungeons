"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import Button from "@/components/ui/Button";

// ============================================
// BACKGROUNDS
// ============================================
function VictoryBackground() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a10] via-[#0d0d08] to-[#050503]" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
        style={{ background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(184,134,11,0.08) 3deg, transparent 6deg, transparent 15deg, rgba(184,134,11,0.06) 18deg, transparent 21deg)` }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-gold/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

function DefeatBackground() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#150808] via-[#0a0505] to-[#050303]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1510]/30 to-[#1a1510]/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}

// ============================================
// VICTORY
// ============================================
function Victory({ score, gold, isDemo }: { score: number; gold: number; isDemo: boolean }) {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4 py-8">
      {/* Trophy */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }} className="relative inline-block mb-6">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl sm:text-8xl">🏆</motion.div>
        <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-3xl rotate-[-15deg]">🌿</span>
        <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl rotate-[15deg] scale-x-[-1]">🌿</span>
      </motion.div>

      <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="font-cinzel text-5xl sm:text-6xl font-black text-gold mb-3 drop-shadow-[0_0_20px_rgba(184,134,11,0.4)]">
        VICTORIOUS!
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="font-crimson text-lg text-parchment/70 mb-8 italic">
        {isDemo ? "You conquered the demo!" : "You emerged triumphant!"}
      </motion.p>

      {/* Stats */}
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
        className="bg-[#2a2a32]/80 backdrop-blur rounded-lg border border-gold/30 p-6 max-w-sm mx-auto mb-6">
        <h2 className="font-cinzel text-gold mb-4 border-b border-gold/20 pb-2">{isDemo ? "Demo Results" : "War Commendation"}</h2>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-parchment/60">Glory</span><span className="font-cinzel text-xl text-gold">{score}</span></div>
          <div className="flex justify-between"><span className="text-parchment/60">Gold</span><span className="font-cinzel text-xl text-gold">{gold}</span></div>
          <div className="flex justify-between border-t border-gold/10 pt-2">
            <span className="text-parchment/60">Rank</span>
            <span className="font-cinzel text-gold">{score >= 500 ? "🏅 Champion" : score >= 300 ? "⚔️ Veteran" : "🛡️ Survivor"}</span>
          </div>
        </div>
      </motion.div>

      {/* Demo notice */}
      {isDemo && (
        <p className="text-parchment/50 text-sm mb-6">🎮 Demo rewards are simulated. Connect wallet for real TND!</p>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gold" onClick={() => router.push(isDemo ? "/dungeon?demo=true" : "/dungeon")}>
          {isDemo ? "Play Again" : "Enter Again"}
        </Button>
        {isDemo ? (
          <Button variant="primary" onClick={() => router.push("/")}>Connect Wallet</Button>
        ) : (
          <Button variant="primary" onClick={() => alert("Claiming...")}>Claim Reward</Button>
        )}
      </motion.div>

      <button onClick={() => router.push("/")} className="mt-4 text-parchment/40 hover:text-parchment/60 text-sm font-cinzel">
        Return to Camp
      </button>
    </motion.div>
  );
}

// ============================================
// DEFEAT
// ============================================
function Defeat({ isDemo }: { isDemo: boolean }) {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4 py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [-5, 5, 0] }} transition={{ type: "spring", delay: 0.3 }}
        className="text-7xl sm:text-8xl grayscale-[50%] mb-6">💀</motion.div>

      <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="font-cinzel text-5xl sm:text-6xl font-black text-blood mb-3 drop-shadow-[0_0_20px_rgba(139,0,0,0.4)]">
        FALLEN
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="font-crimson text-lg text-parchment/50 mb-8 italic">
        {isDemo ? "The demo trenches bested you..." : "The trenches claimed another soul..."}
      </motion.p>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
        className="bg-[#1a1515]/80 backdrop-blur rounded-lg border border-blood/30 p-6 max-w-sm mx-auto mb-6">
        <p className="font-crimson text-parchment/50">
          {isDemo ? "Don't worry — just practice! Try again." : "All gold and glory lost to darkness."}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="danger" onClick={() => router.push(isDemo ? "/dungeon?demo=true" : "/dungeon")}>Try Again</Button>
        {isDemo && <Button variant="primary" onClick={() => router.push("/")}>Connect Wallet</Button>}
      </motion.div>

      <button onClick={() => router.push("/")} className="mt-4 text-parchment/40 hover:text-parchment/60 text-sm font-cinzel">
        Return to Camp
      </button>
    </motion.div>
  );
}

// ============================================
// MAIN
// ============================================
function EndContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get("result") || "defeat";
  const score = parseInt(searchParams.get("score") || "0");
  const gold = parseInt(searchParams.get("gold") || "0");
  const isDemo = searchParams.get("demo") === "true";
  const isVictory = result === "victory";

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {isVictory ? <VictoryBackground /> : <DefeatBackground />}
      
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-mystic/90 py-2 text-center border-b border-mystic-light/20">
          <p className="font-cinzel text-sm text-parchment">🎮 <span className="text-gold">DEMO</span></p>
        </div>
      )}

      <div className={`relative z-10 w-full ${isDemo ? "pt-10" : ""}`}>
        {isVictory ? <Victory score={score} gold={gold} isDemo={isDemo} /> : <Defeat isDemo={isDemo} />}
      </div>
    </main>
  );
}

export default function EndPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-abyss"><p className="text-parchment animate-pulse">Loading...</p></div>}>
      <EndContent />
    </Suspense>
  );
}
