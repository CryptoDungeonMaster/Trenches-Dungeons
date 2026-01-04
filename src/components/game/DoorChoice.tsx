"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { doorCreakOpen, doorDustParticles } from "@/lib/motion";

interface DoorChoiceProps {
  onChoose: (choice: "left" | "right") => void;
  disabled?: boolean;
}

// Torch SVG component
const Torch = ({ side }: { side: "left" | "right" }) => (
  <div className={cn("absolute top-1/4", side === "left" ? "-left-8" : "-right-8")}>
    <div className="relative">
      {/* Torch handle */}
      <div className="w-3 h-16 bg-gradient-to-b from-trench-rust to-trench-mud rounded-b-sm" />
      
      {/* Flame */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.95, 1.05, 1],
          opacity: [0.9, 1, 0.85, 0.95, 0.9],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute -top-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 bg-gradient-to-t from-blood via-gold to-gold-pale rounded-full blur-[2px]" />
        <div className="absolute inset-1 bg-gradient-to-t from-gold to-parchment rounded-full blur-[1px]" />
      </motion.div>
      
      {/* Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gold/20 rounded-full blur-xl animate-torch-flicker" />
    </div>
  </div>
);

// Runic symbol SVG
const RunicSymbol = () => (
  <svg viewBox="0 0 40 50" className="w-10 h-12 text-gold/30">
    <path
      d="M20 5 L35 15 L35 35 L20 45 L5 35 L5 15 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M20 10 L20 40 M10 20 L30 30 M30 20 L10 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

// Door component
const Door = ({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-48 h-80 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-abyss",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{ perspective: "1000px" }}
      whileHover={disabled ? undefined : "hover"}
      initial="closed"
      aria-label={`Enter ${side} door`}
    >
      {/* Stone archway frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-trench-stone to-[#3a3a3a] rounded-t-[100px] border-4 border-[#4a4a4a] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
        {/* Arch detail */}
        <div className="absolute top-2 left-2 right-2 h-20 bg-gradient-to-b from-[#5a5a5a] to-transparent rounded-t-[90px] opacity-30" />
        
        {/* Runic symbols */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <RunicSymbol />
        </div>
      </div>

      {/* Door panel */}
      <motion.div
        variants={doorCreakOpen}
        className="absolute inset-4 rounded-t-[80px] overflow-hidden"
        style={{
          transformOrigin: side === "left" ? "left center" : "right center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Wooden door texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a3728] via-trench-mud to-[#2d241c]">
          {/* Wood grain lines */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-black"
                style={{ top: `${12 + i * 12}%` }}
              />
            ))}
          </div>
          
          {/* Metal bands */}
          <div className="absolute top-[20%] left-0 right-0 h-3 bg-gradient-to-b from-trench-metal to-[#3a3a3a] border-y border-black/30" />
          <div className="absolute top-[70%] left-0 right-0 h-3 bg-gradient-to-b from-trench-metal to-[#3a3a3a] border-y border-black/30" />
          
          {/* Door handle */}
          <div
            className={cn(
              "absolute top-1/2 w-4 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full",
              "shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
              side === "left" ? "right-4" : "left-4"
            )}
          />
        </div>

        {/* Dust particles on hover */}
        <motion.div
          variants={doorDustParticles}
          className="absolute top-0 left-1/2 pointer-events-none"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-parchment/40 rounded-full"
              style={{
                left: `${(i - 2) * 15}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Torches */}
      <Torch side={side} />

      {/* Label */}
      <motion.div
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-cinzel text-parchment/60 uppercase tracking-widest text-sm"
        whileHover={{ color: "rgb(212, 165, 116)" }}
      >
        {side === "left" ? "Left Path" : "Right Path"}
      </motion.div>
    </motion.button>
  );
};

export function DoorChoice({ onChoose, disabled }: DoorChoiceProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-cinzel text-3xl text-parchment text-center"
      >
        Choose Your Path
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-parchment/60 text-center max-w-md"
      >
        Two passages lie before you, shrouded in darkness. 
        The air grows cold as whispers echo from within...
      </motion.p>

      {/* Doors */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-16 mt-8"
      >
        <Door side="left" onClick={() => onChoose("left")} disabled={disabled} />
        <Door side="right" onClick={() => onChoose("right")} disabled={disabled} />
      </motion.div>
    </div>
  );
}

export default DoorChoice;
