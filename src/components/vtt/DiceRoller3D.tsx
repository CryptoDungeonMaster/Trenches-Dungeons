"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DiceRoller3DProps {
  onRoll?: (result: number) => void;
  sides?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DiceRoller3D({
  onRoll,
  sides = 20,
  disabled = false,
  size = "md",
  className,
}: DiceRoller3DProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rollRotation, setRollRotation] = useState({ x: 0, y: 0, z: 0 });

  const sizes = {
    sm: { wrapper: "w-20 h-20", dice: 60, text: "text-xl" },
    md: { wrapper: "w-28 h-28", dice: 80, text: "text-3xl" },
    lg: { wrapper: "w-36 h-36", dice: 100, text: "text-4xl" },
  };

  const handleRoll = useCallback(() => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setResult(null);

    // Generate dramatic spin
    const spinsX = (Math.floor(Math.random() * 3) + 4) * 360 + Math.random() * 180;
    const spinsY = (Math.floor(Math.random() * 3) + 4) * 360 + Math.random() * 180;
    const spinsZ = (Math.floor(Math.random() * 2) + 2) * 360 + Math.random() * 90;

    setRollRotation({ x: spinsX, y: spinsY, z: spinsZ });

    setTimeout(() => {
      const rollResult = Math.floor(Math.random() * sides) + 1;
      setResult(rollResult);
      setIsRolling(false);
      onRoll?.(rollResult);
    }, 1800);
  }, [isRolling, disabled, sides, onRoll]);

  const isCritical = result === 20;
  const isFumble = result === 1;
  const diceSize = sizes[size].dice;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* 3D Dice Scene */}
      <motion.div
        onClick={handleRoll}
        className={cn(
          "relative cursor-pointer select-none",
          sizes[size].wrapper,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ perspective: "600px" }}
        whileHover={!disabled && !isRolling ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
      >
        {/* Shadow */}
        <motion.div
          animate={{
            scale: isRolling ? [1, 0.6, 1, 0.7, 1] : 1,
            opacity: isRolling ? [0.3, 0.1, 0.3, 0.15, 0.3] : 0.4,
          }}
          transition={{ duration: 1.8 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/40 rounded-full blur-md"
        />

        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: isRolling ? [0.2, 0.5, 0.2] : result ? (isCritical ? 0.6 : isFumble ? 0.5 : 0.2) : 0.15,
            scale: isRolling ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.4, repeat: isRolling ? Infinity : 0 }}
          className={cn(
            "absolute inset-0 rounded-xl blur-2xl",
            isCritical ? "bg-gold" : isFumble ? "bg-blood" : "bg-orange-500/50"
          )}
        />

        {/* D20 Dice */}
        <motion.div
          animate={{
            rotateX: isRolling ? rollRotation.x : 0,
            rotateY: isRolling ? rollRotation.y : 0,
            rotateZ: isRolling ? rollRotation.z : 0,
            y: isRolling ? [0, -30, 0, -15, 0] : 0,
          }}
          transition={{
            duration: 1.8,
            ease: [0.25, 0.1, 0.25, 1],
            y: { duration: 1.8, times: [0, 0.3, 0.5, 0.7, 1] },
          }}
          className="relative mx-auto"
          style={{
            width: diceSize,
            height: diceSize,
            transformStyle: "preserve-3d",
          }}
        >
          {/* D20 Icosahedron approximation - 20 triangular faces */}
          {/* Top pyramid (5 faces) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`top-${i}`}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${i * 72}deg) rotateX(-30deg) translateZ(${diceSize * 0.4}px)`,
              }}
            >
              <div
                className="absolute bg-gradient-to-br from-[#2a1f1a] via-[#3d2d24] to-[#1a1210] border border-gold/20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${diceSize * 0.35}px solid transparent`,
                  borderRight: `${diceSize * 0.35}px solid transparent`,
                  borderBottom: `${diceSize * 0.6}px solid #3d2d24`,
                  transform: "translateX(-50%) translateY(-30%)",
                  left: "50%",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                }}
              />
            </div>
          ))}

          {/* Middle band (10 faces) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={`mid-${i}`}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${i * 36}deg) translateZ(${diceSize * 0.45}px)`,
              }}
            >
              <div
                className={cn(
                  "absolute w-full h-full",
                  i % 2 === 0
                    ? "bg-gradient-to-b from-[#4a3828] to-[#2a1f1a]"
                    : "bg-gradient-to-b from-[#3d2d24] to-[#1a1210]"
                )}
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  border: "1px solid rgba(184, 134, 11, 0.15)",
                }}
              />
            </div>
          ))}

          {/* Bottom pyramid (5 faces) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`bot-${i}`}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${i * 72 + 36}deg) rotateX(30deg) translateZ(${diceSize * 0.4}px) rotateX(180deg)`,
              }}
            >
              <div
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${diceSize * 0.35}px solid transparent`,
                  borderRight: `${diceSize * 0.35}px solid transparent`,
                  borderBottom: `${diceSize * 0.6}px solid #2a1f1a`,
                  transform: "translateX(-50%) translateY(-30%)",
                  left: "50%",
                }}
              />
            </div>
          ))}

          {/* Main face overlay showing the number */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-gradient-to-br from-[#4a3828] via-[#3d2d24] to-[#2a1f1a]",
              "border-2 rounded-lg shadow-xl",
              isCritical ? "border-gold" : isFumble ? "border-blood" : "border-gold/30"
            )}
            style={{
              transform: "translateZ(1px)",
              clipPath: "polygon(50% 5%, 95% 35%, 80% 90%, 20% 90%, 5% 35%)",
            }}
          >
            {/* Decorative inner border */}
            <div
              className="absolute inset-2 border border-gold/10 rounded"
              style={{ clipPath: "polygon(50% 8%, 92% 36%, 78% 88%, 22% 88%, 8% 36%)" }}
            />

            <AnimatePresence mode="wait">
              {result !== null && !isRolling ? (
                <motion.span
                  key={result}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  className={cn(
                    "font-cinzel font-black drop-shadow-lg",
                    sizes[size].text,
                    isCritical ? "text-gold" : isFumble ? "text-blood" : "text-parchment"
                  )}
                >
                  {result}
                </motion.span>
              ) : (
                <motion.span
                  key="d20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn("font-cinzel text-gold/40", sizes[size].text)}
                >
                  {isRolling ? "..." : `d${sides}`}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Gold trim lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "translateZ(2px)" }}>
            <path
              d="M50,5 L95,35 L80,90 L20,90 L5,35 Z"
              fill="none"
              stroke="rgba(184,134,11,0.3)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.div>

        {/* Sparkles on critical */}
        {isCritical && !isRolling && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-gold rounded-full"
                style={{ transform: "translate(-50%, -50%)" }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Result text */}
      <AnimatePresence>
        {result !== null && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p
              className={cn(
                "font-cinzel font-bold",
                isCritical ? "text-gold text-lg" : isFumble ? "text-blood text-lg" : "text-parchment/80 text-sm"
              )}
            >
              {isCritical ? "⚡ NATURAL 20!" : isFumble ? "💀 FUMBLE!" : `Rolled: ${result}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll button */}
      {!isRolling && result === null && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRoll}
          disabled={disabled}
          className={cn(
            "px-5 py-2 font-cinzel text-sm uppercase tracking-wider",
            "bg-gradient-to-b from-[#4a3828] to-[#2a1f1a]",
            "border border-gold/40 rounded-lg",
            "text-gold hover:text-gold-pale hover:border-gold/60",
            "transition-all shadow-lg",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          🎲 Roll D{sides}
        </motion.button>
      )}
    </div>
  );
}
