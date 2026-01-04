"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import HealthVial from "./HealthVial";
import Panel from "../ui/Panel";

// SVG Icons
const PouchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gold">
    <path d="M12 2C8 2 4 6 4 10v8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4v-8c0-4-4-8-8-8zm0 2c2.5 0 5.5 2.5 6 6H6c.5-3.5 3.5-6 6-6z" />
  </svg>
);

const TallyIcon = ({ count }: { count: number }) => {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;

  return (
    <div className="flex gap-2 items-end">
      {[...Array(groups)].map((_, i) => (
        <div key={i} className="relative w-6 h-6">
          {/* 4 vertical lines */}
          <div className="absolute w-0.5 h-5 bg-gold left-0 top-0" />
          <div className="absolute w-0.5 h-5 bg-gold left-1.5 top-0" />
          <div className="absolute w-0.5 h-5 bg-gold left-3 top-0" />
          <div className="absolute w-0.5 h-5 bg-gold left-[18px] top-0" />
          {/* Diagonal strike */}
          <div className="absolute w-7 h-0.5 bg-gold top-2.5 -left-0.5 rotate-[-20deg]" />
        </div>
      ))}
      {remainder > 0 && (
        <div className="flex gap-0.5">
          {[...Array(remainder)].map((_, i) => (
            <div key={i} className="w-0.5 h-5 bg-gold-light" />
          ))}
        </div>
      )}
    </div>
  );
};

interface HUDProps {
  health: number;
  maxHealth: number;
  gold: number;
  score: number;
  tokenBalance?: number;
}

export function HUD({ health, maxHealth, gold, score, tokenBalance = 0 }: HUDProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full flex items-start justify-between gap-4 p-4"
    >
      {/* Left: Health */}
      <div className="flex items-center gap-4">
        <HealthVial current={health} max={maxHealth} size="md" />
        <div className="font-cinzel text-sm text-parchment-dark uppercase tracking-wider">
          Vitality
        </div>
      </div>

      {/* Center: Score as tally marks */}
      <Panel variant="leather" className="px-6 py-3">
        <div className="flex flex-col items-center gap-2">
          <span className="font-cinzel text-xs text-parchment/60 uppercase tracking-widest">
            Glory
          </span>
          <div className="flex items-center gap-2">
            <TallyIcon count={Math.floor(score / 100)} />
            <span className="font-cinzel text-gold text-xl ml-2">
              {score}
            </span>
          </div>
        </div>
      </Panel>

      {/* Right: Gold & Token Balance */}
      <div className="flex items-center gap-6">
        {/* Gold Pouch */}
        <Panel variant="leather" className="px-4 py-2">
          <div className="flex items-center gap-3">
            <PouchIcon />
            <div className="flex flex-col">
              <span className="font-cinzel text-xs text-parchment/60 uppercase">
                Gold
              </span>
              <span className="font-cinzel text-gold text-lg">
                {gold.toLocaleString()}
              </span>
            </div>
          </div>
        </Panel>

        {/* Token Balance Plaque */}
        <Panel variant="metal" className="px-4 py-2">
          <div className="flex flex-col items-center">
            <span className="font-cinzel text-xs text-parchment/60 uppercase tracking-wider">
              TND
            </span>
            <span className="font-cinzel text-parchment text-lg">
              {tokenBalance.toLocaleString()}
            </span>
          </div>
        </Panel>
      </div>
    </motion.div>
  );
}

export default HUD;
