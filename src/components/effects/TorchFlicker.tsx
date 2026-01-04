"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TorchFlickerProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size?: "sm" | "md" | "lg";
  color?: "gold" | "blood" | "mystic";
  className?: string;
}

const positionStyles = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const sizeStyles = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
};

const colorStyles = {
  gold: "from-gold/20 via-gold/10 to-transparent",
  blood: "from-blood/20 via-blood/10 to-transparent",
  mystic: "from-mystic/20 via-mystic/10 to-transparent",
};

export function TorchFlicker({
  position = "top-left",
  size = "md",
  color = "gold",
  className,
}: TorchFlickerProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 0.8, 0.6, 0.9, 0.7, 0.5],
        scale: [1, 1.05, 0.98, 1.02, 0.99, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        "bg-gradient-radial",
        positionStyles[position],
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      style={{
        background: `radial-gradient(ellipse at center, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 40%, var(--tw-gradient-to) 70%)`,
      }}
    />
  );
}

export default TorchFlicker;
