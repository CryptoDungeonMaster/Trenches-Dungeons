"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DiceRollerProps {
  onRollComplete?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { container: "w-12 h-12", face: "w-12 h-12 text-lg", offset: 24 },
  md: { container: "w-16 h-16", face: "w-16 h-16 text-2xl", offset: 32 },
  lg: { container: "w-20 h-20", face: "w-20 h-20 text-3xl", offset: 40 },
};

// D20 face values arranged for 3D cube approximation
const DICE_FACES = [20, 1, 8, 12, 15, 6];

export function DiceRoller({
  onRollComplete,
  size = "md",
  className,
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(20);
  const controls = useAnimation();
  const styles = sizeStyles[size];

  const rollDice = useCallback(async () => {
    if (isRolling) return;

    setIsRolling(true);

    // Generate final value
    const finalValue = Math.floor(Math.random() * 20) + 1;

    // Animate the dice
    await controls.start({
      rotateX: [0, 720, 1440, 1800 + (finalValue % 6) * 60],
      rotateY: [0, -540, -1080, -1350 + (finalValue % 4) * 90],
      rotateZ: [0, 360, 720, 900],
      transition: {
        duration: 2,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.3, 0.7, 1],
      },
    });

    // Settle animation
    await controls.start({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: [1.1, 1],
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    });

    setCurrentValue(finalValue);
    setIsRolling(false);
    onRollComplete?.(finalValue);
  }, [isRolling, controls, onRollComplete]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* 3D Dice Container */}
      <div
        className="cursor-pointer"
        style={{ perspective: "600px" }}
        onClick={rollDice}
        role="button"
        aria-label={isRolling ? "Rolling dice..." : "Click to roll dice"}
      >
        <motion.div
          animate={controls}
          className={cn("relative", styles.container)}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Dice faces */}
          {DICE_FACES.map((value, index) => {
            const transforms = [
              `translateZ(${styles.offset}px)`, // front
              `rotateY(180deg) translateZ(${styles.offset}px)`, // back
              `rotateY(-90deg) translateZ(${styles.offset}px)`, // left
              `rotateY(90deg) translateZ(${styles.offset}px)`, // right
              `rotateX(90deg) translateZ(${styles.offset}px)`, // top
              `rotateX(-90deg) translateZ(${styles.offset}px)`, // bottom
            ];

            return (
              <div
                key={index}
                className={cn(
                  "absolute flex items-center justify-center",
                  "bg-gradient-to-br from-parchment via-parchment-dark to-parchment",
                  "border-2 border-trench-mud",
                  "font-cinzel font-bold text-abyss",
                  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]",
                  styles.face
                )}
                style={{
                  transform: transforms[index],
                  backfaceVisibility: "hidden",
                }}
              >
                {value}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Roll result */}
      <motion.div
        key={currentValue}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-cinzel text-4xl font-bold"
      >
        <span
          className={cn(
            currentValue === 20 && "text-gold animate-pulse",
            currentValue === 1 && "text-blood",
            currentValue > 1 && currentValue < 20 && "text-parchment"
          )}
        >
          {currentValue}
        </span>
      </motion.div>

      {/* Critical indicators */}
      {currentValue === 20 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cinzel text-gold text-sm uppercase tracking-widest"
        >
          Critical Hit!
        </motion.div>
      )}
      {currentValue === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cinzel text-blood text-sm uppercase tracking-widest"
        >
          Critical Fail!
        </motion.div>
      )}

      {/* Roll instruction */}
      {!isRolling && (
        <p className="text-parchment/50 text-sm">Click to roll</p>
      )}
    </div>
  );
}

export default DiceRoller;
