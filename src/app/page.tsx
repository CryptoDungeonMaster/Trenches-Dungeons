"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

// ============================================
// CINEMATIC BACKGROUND SCENE
// ============================================
function CinematicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-[#0a0a12] to-[#050508]" />
      
      {/* Mountain silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-[30vh]">
        <svg viewBox="0 0 1440 300" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0,300 L0,200 Q200,120 400,180 T800,140 T1200,200 L1440,160 L1440,300 Z" fill="#1a1a2e" fillOpacity="0.5" />
          <path d="M0,300 L0,240 Q300,180 500,220 T900,190 T1300,240 L1440,210 L1440,300 Z" fill="#12121c" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Distant fires */}
      <div className="absolute bottom-[20vh] left-[10%] w-2 h-6">
        <motion.div animate={{ opacity: [0.3, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-full h-full bg-gradient-to-t from-orange-600 to-transparent rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-[22vh] right-[15%] w-2 h-8">
        <motion.div animate={{ opacity: [0.4, 0.9, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          className="w-full h-full bg-gradient-to-t from-orange-700 to-transparent rounded-full blur-sm" />
      </div>

      {/* Fog layers */}
      <motion.div
        animate={{ x: ["-50%", "50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
        className="absolute inset-0 opacity-[0.06]"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)" }}
      />

      {/* Ground fog */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-[#0a0a0f]/90 to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
    </div>
  );
}

// ============================================
// EMBER PARTICLES
// ============================================
function EmberParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 10 + Math.random() * 10, size: 1 + Math.random() * 2,
    })));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div key={p.id}
          initial={{ x: `${p.x}%`, y: "100%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: `radial-gradient(circle, #fbbf24 0%, #ea580c 100%)`, boxShadow: `0 0 ${p.size * 2}px #ea580c` }}
        />
      ))}
    </div>
  );
}

// ============================================
// HEADER
// ============================================
function Header({ isConnected, onConnect, balance }: { isConnected: boolean; onConnect: () => void; balance: number }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <span className="font-cinzel text-lg text-gold hidden sm:block">T&D</span>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-abyss/80 backdrop-blur border border-gold/20 rounded-lg">
              <span className="text-gold/60 text-sm">TND</span>
              <span className="text-gold font-cinzel font-bold">{balance.toLocaleString()}</span>
            </div>
          )}
          
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onConnect}
            className={`px-4 py-2 rounded-lg font-cinzel text-sm uppercase tracking-wide transition-all ${
              isConnected 
                ? "bg-green-900/70 text-green-200 border border-green-500/30" 
                : "bg-gold/15 text-gold border border-gold/30 hover:border-gold/50"
            }`}>
            {isConnected ? "● Connected" : "Connect Wallet"}
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// DRAMATIC GATEWAY
// ============================================
function DramaticGateway({ onEnter, disabled }: { onEnter: () => void; disabled: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        animate={{ opacity: isHovered ? 0.4 : 0.15, scale: isHovered ? 1.05 : 1 }}
        className="absolute inset-0 bg-gold/20 rounded-t-[140px] blur-2xl -z-10"
      />

      {/* Gateway */}
      <div 
        className="relative w-56 sm:w-72 h-80 sm:h-96 cursor-pointer"
        style={{ perspective: "1200px" }}
        onClick={() => !disabled && onEnter()}
      >
        {/* Stone arch */}
        <div className="absolute inset-0 rounded-t-[120px] bg-gradient-to-b from-[#3a3a42] via-[#2a2a32] to-[#1a1a22] border-2 border-[#4a4a52] shadow-2xl overflow-hidden">
          {/* Arch carvings */}
          <svg className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-16 text-gold/20" viewBox="0 0 150 60">
            <path d="M75 5 L100 25 L75 45 L50 25 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="75" cy="25" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Door */}
        <motion.div
          animate={{ rotateY: isHovered ? -20 : 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          className="absolute inset-4 sm:inset-5 top-6 rounded-t-[100px] overflow-hidden"
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#4a3528] via-[#3a2a1e] to-[#2a1a10]">
            {/* Wood grain */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-full h-[1px] bg-black/15" style={{ top: `${8 + i * 8}%` }} />
            ))}
            
            {/* Metal bands */}
            {[15, 50, 80].map((top) => (
              <div key={top} className="absolute left-0 right-0 h-4 bg-gradient-to-b from-[#5a5a62] to-[#3a3a42] border-y border-black/30" style={{ top: `${top}%` }} />
            ))}

            {/* Door ring */}
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-gold bg-gradient-to-br from-gold-light to-gold-dark shadow-lg" />

            {/* Glowing rune */}
            <motion.svg animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-[28%] left-1/2 -translate-x-1/2 w-10 h-12 text-gold" viewBox="0 0 40 50">
              <path d="M20 3 L35 15 L35 35 L20 47 L5 35 L5 15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" filter="url(#glow)" />
              <path d="M20 10 L20 40 M12 22 L28 28" stroke="currentColor" strokeWidth="1" />
              <defs><filter id="glow"><feGaussianBlur stdDeviation="1.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
            </motion.svg>
          </div>

          {/* Light behind door on hover */}
          {isHovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-gold/15 to-transparent" />
          )}
        </motion.div>

        {/* Torches */}
        {["left", "right"].map((side) => (
          <div key={side} className={`absolute top-1/4 ${side === "left" ? "-left-8 sm:-left-10" : "-right-8 sm:-right-10"}`}>
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }} transition={{ duration: 0.4, repeat: Infinity }}
              className="w-5 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-full blur-[2px]" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-b from-[#4a3020] to-[#3a2010] rounded-b" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-gold/15 rounded-full blur-xl" />
          </div>
        ))}
      </div>

      {/* CTA below door */}
      <div className="text-center mt-6">
        <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
          className="font-cinzel text-base sm:text-lg text-gold/80 tracking-widest uppercase">
          {disabled ? "Connect to Enter" : "Click to Enter"}
        </motion.p>
        <p className="font-crimson text-sm text-parchment/40 mt-1">Entry: 100 TND</p>
      </div>
    </motion.div>
  );
}

// ============================================
// TYPEWRITER NARRATION
// ============================================
function Narration() {
  const [text, setText] = useState("");
  const fullText = "Beyond these gates lies glory... or doom.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
      className="font-crimson text-lg sm:text-xl text-parchment/70 italic text-center max-w-lg h-8">
      &ldquo;{text}&rdquo;
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-[2px] h-5 bg-gold/60 ml-1 align-middle" />
    </motion.p>
  );
}

// ============================================
// DEMO CTA
// ============================================
function DemoButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="mt-8 px-6 py-3 bg-mystic/60 hover:bg-mystic/80 border border-mystic-light/30 rounded-lg font-cinzel text-sm text-parchment uppercase tracking-wider transition-colors"
    >
      🎮 Try Demo Mode <span className="text-parchment/50 ml-1">— No Wallet</span>
    </motion.button>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <CinematicBackground />
      <EmberParticles />
      <Header isConnected={isConnected} onConnect={() => setIsConnected(!isConnected)} balance={1250} />

      {/* Main content - centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <p className="font-cinzel text-xs sm:text-sm text-gold/60 uppercase tracking-[0.2em] mb-2">A Solana-Powered Dungeon Crawler</p>
          <h1 className="font-cinzel text-5xl sm:text-6xl md:text-7xl font-black leading-none">
            <span className="bg-gradient-to-b from-gold-pale via-gold to-gold-dark bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(184,134,11,0.3)]">TRENCHES</span>
            <span className="block text-3xl sm:text-4xl text-blood/80 my-1">&</span>
            <span className="bg-gradient-to-b from-parchment via-parchment-dark to-trench-mud/80 bg-clip-text text-transparent">DRAGONS</span>
          </h1>
        </motion.div>

        {/* Narration */}
        <div className="mb-8">
          <Narration />
        </div>

        {/* Gateway */}
        <DramaticGateway onEnter={() => router.push("/dungeon")} disabled={!isConnected} />

        {/* Demo button */}
        <DemoButton onClick={() => setShowDemoModal(true)} />

        {/* Hint for non-connected */}
        <AnimatePresence>
          {!isConnected && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-parchment/40 text-sm font-crimson">
              Connect wallet to play with tokens
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-parchment/20 text-xs font-crimson">Trenches & Dragons © 2026 • Powered by Solana</p>
      </div>

      {/* Demo Modal */}
      <Modal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} title="⚔️ Demo Mode">
        <div className="space-y-4">
          <p className="font-crimson text-parchment">Experience the full dungeon adventure without connecting your wallet.</p>
          
          <div className="bg-abyss/40 rounded-lg p-4 border border-gold/10">
            <ul className="font-crimson text-parchment/80 text-sm space-y-2">
              <li>⚔ Combat with dice mechanics</li>
              <li>💰 Treasure and gold rewards</li>
              <li>⚠ Traps and rest encounters</li>
              <li>🏆 Victory and defeat endings</li>
            </ul>
          </div>

          <p className="font-crimson text-xs text-parchment/50">Demo rewards are simulated. Connect wallet to earn real TND!</p>

          <div className="flex gap-3">
            <Button variant="primary" onClick={() => { setShowDemoModal(false); router.push("/dungeon?demo=true"); }} className="flex-1">
              Start Demo
            </Button>
            <Button variant="ghost" onClick={() => setShowDemoModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
