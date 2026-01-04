"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface DustMotesProps {
  count?: number;
  className?: string;
}

export function DustMotes({ count = 20, className }: DustMotesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  }, [count]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 30}%`, `${particle.y - 20}%`, `${particle.y - 40}%`],
            x: [
              `${particle.x}%`,
              `${particle.x + 5}%`,
              `${particle.x - 3}%`,
              `${particle.x + 8}%`,
            ],
            opacity: [0, 0.4, 0.6, 0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-parchment/60"
          style={{
            width: particle.size,
            height: particle.size,
            boxShadow: `0 0 ${particle.size * 2}px rgba(244, 228, 188, 0.3)`,
          }}
        />
      ))}
    </div>
  );
}

export default DustMotes;
