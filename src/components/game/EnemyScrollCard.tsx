"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { scrollUnfurl } from "@/lib/motion";

interface Enemy {
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  description?: string;
}

interface EnemyScrollCardProps {
  enemy: Enemy;
  className?: string;
}

// Skull icon for enemy
const SkullIcon = () => (
  <svg viewBox="0 0 48 48" className="w-16 h-16 text-parchment-dark">
    <ellipse cx="24" cy="22" rx="16" ry="18" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="20" r="4" fill="currentColor" />
    <circle cx="31" cy="20" r="4" fill="currentColor" />
    <path d="M24 28 L24 34" stroke="currentColor" strokeWidth="2" />
    <path d="M18 38 L24 34 L30 38" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M20 42 L24 38 L28 42" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function EnemyScrollCard({ enemy, className }: EnemyScrollCardProps) {
  const healthPercentage = (enemy.health / enemy.maxHealth) * 100;

  return (
    <motion.div
      variants={scrollUnfurl}
      initial="rolled"
      animate="unfurled"
      className={cn("relative", className)}
    >
      {/* Scroll container */}
      <div className="relative">
        {/* Top scroll roll */}
        <div className="absolute -top-3 left-0 right-0 h-6 bg-gradient-to-b from-trench-mud via-[#5a4a3a] to-trench-mud rounded-full shadow-lg z-10" />
        
        {/* Main scroll body */}
        <div className="relative bg-gradient-to-b from-parchment via-parchment to-parchment-dark border-x-4 border-trench-mud pt-6 pb-4 px-6 min-w-[280px]">
          {/* Parchment texture */}
          <div className="absolute inset-0 texture-parchment opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* Enemy icon */}
            <div className="relative">
              <SkullIcon />
              {/* Glow effect for dangerous enemies */}
              {enemy.damage >= 10 && (
                <div className="absolute inset-0 bg-blood/20 rounded-full blur-xl animate-pulse" />
              )}
            </div>

            {/* Enemy name */}
            <h3 className="font-cinzel text-xl font-bold text-blood-dark text-center">
              {enemy.name}
            </h3>

            {/* Description */}
            {enemy.description && (
              <p className="text-sm text-abyss/70 text-center italic font-crimson">
                &ldquo;{enemy.description}&rdquo;
              </p>
            )}

            {/* Stats */}
            <div className="w-full space-y-3 mt-2">
              {/* Health bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-abyss/70 font-cinzel uppercase">
                  <span>Vitality</span>
                  <span>{enemy.health}/{enemy.maxHealth}</span>
                </div>
                <div className="h-3 bg-abyss/20 rounded-full overflow-hidden border border-abyss/30">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${healthPercentage}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className={cn(
                      "h-full rounded-full",
                      healthPercentage > 50 ? "bg-blood" : healthPercentage > 25 ? "bg-orange-600" : "bg-blood-dark"
                    )}
                  />
                </div>
              </div>

              {/* Damage stat */}
              <div className="flex items-center justify-between px-2 py-1 bg-abyss/10 rounded">
                <span className="font-cinzel text-sm text-abyss/70 uppercase">Damage</span>
                <span className="font-cinzel text-lg text-blood-dark font-bold">{enemy.damage}</span>
              </div>
            </div>
          </div>

          {/* Aged edges */}
          <div className="absolute top-6 left-0 w-2 h-full bg-gradient-to-r from-black/10 to-transparent" />
          <div className="absolute top-6 right-0 w-2 h-full bg-gradient-to-l from-black/10 to-transparent" />
        </div>

        {/* Bottom scroll roll */}
        <div className="absolute -bottom-3 left-0 right-0 h-6 bg-gradient-to-b from-trench-mud via-[#5a4a3a] to-trench-mud rounded-full shadow-lg" />
      </div>
    </motion.div>
  );
}

export default EnemyScrollCard;
