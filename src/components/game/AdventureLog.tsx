"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { typewriterContainer, typewriterChar } from "@/lib/motion";

interface LogEntry {
  id: string;
  text: string;
  type?: "narrative" | "combat" | "loot" | "danger" | "success";
  timestamp?: number;
}

interface AdventureLogProps {
  entries: LogEntry[];
  maxHeight?: string;
  className?: string;
}

const typeStyles: Record<string, string> = {
  narrative: "text-parchment-dark",
  combat: "text-blood-dark",
  loot: "text-gold-dark",
  danger: "text-blood",
  success: "text-green-800",
};

// Typewriter text component
const TypewriterText = ({ text, type = "narrative" }: { text: string; type?: string }) => {
  return (
    <motion.span
      variants={typewriterContainer}
      initial="hidden"
      animate="visible"
      className={cn("inline", typeStyles[type])}
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={typewriterChar}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export function AdventureLog({ entries, maxHeight = "300px", className }: AdventureLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className={cn("relative", className)}>
      {/* Scroll top decoration */}
      <div className="absolute -top-2 left-4 right-4 h-4 bg-gradient-to-b from-trench-mud via-[#5a4a3a] to-trench-mud rounded-full shadow-md z-10" />

      {/* Parchment scroll body */}
      <div className="relative bg-gradient-to-b from-parchment via-parchment to-parchment-dark border-x-4 border-trench-mud pt-4">
        {/* Texture overlay */}
        <div className="absolute inset-0 texture-parchment opacity-30" />

        {/* Scroll content */}
        <div
          ref={scrollRef}
          className="relative z-10 px-6 overflow-y-auto scrollbar-thin"
          style={{ maxHeight }}
        >
          {/* Title */}
          <h3 className="font-cinzel text-lg text-blood-dark text-center mb-4 border-b border-trench-mud/30 pb-2">
            Chronicle of the Trenches
          </h3>

          {/* Log entries */}
          <div className="space-y-3 pb-4">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-4"
                >
                  {/* Bullet point */}
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-blood-dark/40" />
                  
                  {/* Entry text */}
                  <p className="font-crimson text-sm leading-relaxed">
                    {index === entries.length - 1 ? (
                      <TypewriterText text={entry.text} type={entry.type} />
                    ) : (
                      <span className={typeStyles[entry.type || "narrative"]}>
                        {entry.text}
                      </span>
                    )}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {entries.length === 0 && (
              <p className="text-center text-abyss/40 italic font-crimson">
                Your adventure awaits...
              </p>
            )}
          </div>
        </div>

        {/* Ink stain decorations */}
        <div className="absolute bottom-8 right-6 w-8 h-8 bg-abyss/5 rounded-full blur-sm" />
        <div className="absolute top-20 left-8 w-4 h-4 bg-abyss/5 rounded-full blur-sm" />

        {/* Aged edge shadows */}
        <div className="absolute top-4 left-0 w-4 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <div className="absolute top-4 right-0 w-4 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Scroll bottom decoration */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gradient-to-b from-trench-mud via-[#5a4a3a] to-trench-mud rounded-full shadow-md" />

      {/* Fade overlay at top when scrolled */}
      <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-b from-parchment to-transparent pointer-events-none z-20" />
    </div>
  );
}

export default AdventureLog;
