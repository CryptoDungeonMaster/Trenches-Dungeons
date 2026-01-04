"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { chestLidOpen, chestParticles } from "@/lib/motion";

interface TreasureChestProps {
  gold: number;
  onOpen?: () => void;
  autoOpen?: boolean;
  className?: string;
}

// Coin sparkle component
const CoinSparkle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      y: [-20, -60, -100],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 1.5,
      delay,
      ease: "easeOut",
    }}
    className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-gold-pale to-gold"
    style={{
      left: `${30 + Math.random() * 40}%`,
      boxShadow: "0 0 8px rgba(184, 134, 11, 0.6)",
    }}
  />
);

export function TreasureChest({
  gold,
  onOpen,
  autoOpen = false,
  className,
}: TreasureChestProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [showParticles, setShowParticles] = useState(autoOpen);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    setShowParticles(true);
    onOpen?.();
  };

  return (
    <motion.div
      className={cn("relative flex flex-col items-center", className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Chest container */}
      <button
        onClick={handleOpen}
        disabled={isOpen}
        className={cn(
          "relative w-48 h-40 cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          isOpen && "cursor-default"
        )}
        style={{ perspective: "500px" }}
        aria-label={isOpen ? "Treasure chest (opened)" : "Open treasure chest"}
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: isOpen ? [0.4, 0.7, 0.4] : 0,
            scale: isOpen ? [1, 1.1, 1] : 1,
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-gold/20 rounded-lg blur-xl"
        />

        {/* Chest base */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-[#5a4030] via-trench-mud to-[#3a2a1c] rounded-lg border-2 border-[#6a5040] shadow-lg">
          {/* Wood grain */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-black/50"
                style={{ top: `${15 + i * 15}%` }}
              />
            ))}
          </div>
          
          {/* Metal band */}
          <div className="absolute top-1/2 left-0 right-0 h-4 bg-gradient-to-b from-trench-metal to-[#3a3a3a] border-y border-black/40" />
          
          {/* Lock plate */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-gradient-to-b from-gold to-gold-dark rounded-sm border border-gold-dark/50">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-3 bg-abyss rounded-full" />
          </div>

          {/* Gold pile inside (visible when open) */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="w-4 h-4 rounded-full bg-gradient-to-br from-gold-pale to-gold shadow-md"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chest lid */}
        <motion.div
          variants={chestLidOpen}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          className="absolute top-0 w-full h-24 origin-bottom"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Lid front face */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#6a5040] via-[#5a4030] to-trench-mud rounded-t-lg border-2 border-[#7a6050] shadow-md">
            {/* Wood grain */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-px bg-black/50"
                  style={{ top: `${20 + i * 20}%` }}
                />
              ))}
            </div>
            
            {/* Metal band */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-trench-metal to-[#3a3a3a] border-y border-black/40" />
            
            {/* Decorative studs */}
            <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-gradient-to-br from-gold to-gold-dark" />
            <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-gradient-to-br from-gold to-gold-dark" />
          </div>
        </motion.div>

        {/* Sparkle particles */}
        <AnimatePresence>
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[...Array(8)].map((_, i) => (
                <CoinSparkle key={i} delay={0.2 + i * 0.1} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </button>

      {/* Gold amount */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="font-cinzel text-sm text-parchment/60 uppercase tracking-widest">
          Treasure Found
        </p>
        <motion.p
          key={gold}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="font-cinzel text-3xl font-bold text-gold"
        >
          {gold.toLocaleString()} Gold
        </motion.p>
      </motion.div>

      {/* Instruction */}
      {!isOpen && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 text-parchment/50 text-sm"
        >
          Click to open
        </motion.p>
      )}
    </motion.div>
  );
}

export default TreasureChest;
