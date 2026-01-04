"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleDialProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleDial({ label, checked, onChange, disabled }: ToggleDialProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Brass dial switch */}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative w-16 h-8 rounded-full transition-all duration-300",
          "bg-gradient-to-b from-trench-metal to-[#3a3a3a]",
          "border-2",
          checked ? "border-gold" : "border-trench-stone",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-abyss"
        )}
      >
        {/* Track glow when on */}
        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-full bg-gold/10"
          />
        )}

        {/* Brass knob */}
        <motion.div
          animate={{
            x: checked ? 32 : 0,
            rotate: checked ? 180 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className={cn(
            "absolute top-0.5 left-0.5 w-6 h-6 rounded-full",
            "bg-gradient-to-br",
            checked
              ? "from-gold-pale via-gold to-gold-dark"
              : "from-[#6a6a6a] via-trench-stone to-[#4a4a4a]",
            "border border-black/20",
            "shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]"
          )}
        >
          {/* Knob detail lines */}
          <div className="absolute inset-2 flex flex-col justify-center gap-0.5">
            <div className={cn("h-px", checked ? "bg-gold-dark/40" : "bg-black/20")} />
            <div className={cn("h-px", checked ? "bg-gold-dark/40" : "bg-black/20")} />
          </div>
        </motion.div>
      </button>

      {/* Label */}
      <span className="font-crimson text-parchment group-hover:text-gold transition-colors">
        {label}
      </span>
    </label>
  );
}

export default ToggleDial;
