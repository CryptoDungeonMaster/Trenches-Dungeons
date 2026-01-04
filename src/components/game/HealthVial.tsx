"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { hudDamageShake } from "@/lib/motion";

interface HealthVialProps {
  current: number;
  max: number;
  showValues?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-20",
  md: "w-12 h-28",
  lg: "w-16 h-36",
};

export function HealthVial({
  current,
  max,
  showValues = true,
  size = "md",
  className,
}: HealthVialProps) {
  const controls = useAnimation();
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  // Trigger shake on damage
  useEffect(() => {
    controls.start("damage").then(() => controls.start("idle"));
  }, [current, controls]);

  // Color based on health percentage
  const getColor = () => {
    if (percentage > 60) return "from-blood to-blood-dark";
    if (percentage > 30) return "from-orange-600 to-orange-800";
    return "from-blood-dark to-[#4a0000]";
  };

  return (
    <motion.div
      variants={hudDamageShake}
      animate={controls}
      initial="idle"
      className={cn("flex flex-col items-center gap-2", className)}
    >
      {/* Vial container */}
      <div
        className={cn(
          "relative rounded-b-full rounded-t-lg overflow-hidden",
          "bg-gradient-to-b from-[#1a1a24] to-abyss",
          "border-2 border-trench-stone",
          "shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.5)]",
          sizeStyles[size]
        )}
      >
        {/* Glass highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />

        {/* Liquid */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={cn(
            "absolute bottom-0 left-0 right-0",
            "bg-gradient-to-t",
            getColor()
          )}
        >
          {/* Liquid surface highlight */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/30 to-transparent" />
          
          {/* Bubbles */}
          <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/20 animate-dust-float" />
          <div className="absolute bottom-4 right-3 w-1.5 h-1.5 rounded-full bg-white/15 animate-dust-float" style={{ animationDelay: "0.5s" }} />
        </motion.div>

        {/* Glass rim */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-trench-metal to-trench-stone border-b border-black/30" />

        {/* Crack overlay for low health */}
        {percentage <= 30 && (
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 40 100"
            preserveAspectRatio="none"
          >
            <path
              d="M15 10 L20 25 L18 40 L22 55 L17 70 L20 85"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              className="text-blood"
            />
          </svg>
        )}
      </div>

      {/* Values */}
      {showValues && (
        <div className="font-cinzel text-sm text-parchment">
          <span className={cn(percentage <= 30 && "text-blood animate-pulse")}>
            {current}
          </span>
          <span className="text-parchment/50">/{max}</span>
        </div>
      )}
    </motion.div>
  );
}

export default HealthVial;
