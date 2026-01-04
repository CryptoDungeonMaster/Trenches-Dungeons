"use client";

import { cn } from "@/lib/utils";

interface FogProps {
  intensity?: "light" | "medium" | "heavy";
  className?: string;
}

export function Fog({ intensity = "medium", className }: FogProps) {
  const opacityMap = {
    light: "opacity-30",
    medium: "opacity-50",
    heavy: "opacity-70",
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Primary fog layer */}
      <div
        className={cn(
          "absolute inset-0 w-[200%]",
          opacityMap[intensity]
        )}
        style={{
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              rgba(244, 228, 188, 0.08) 20%, 
              rgba(244, 228, 188, 0.12) 50%, 
              rgba(244, 228, 188, 0.08) 80%, 
              transparent 100%
            )
          `,
          animation: "fogDrift 30s linear infinite",
        }}
      />

      {/* Secondary fog layer (slower, opposite direction) */}
      <div
        className={cn(
          "absolute inset-0 w-[200%]",
          intensity === "heavy" ? "opacity-40" : "opacity-25"
        )}
        style={{
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              rgba(74, 28, 107, 0.05) 30%, 
              rgba(74, 28, 107, 0.08) 50%, 
              rgba(74, 28, 107, 0.05) 70%, 
              transparent 100%
            )
          `,
          animation: "fogDrift 45s linear infinite reverse",
        }}
      />

      {/* Bottom ground fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `
            linear-gradient(to top,
              rgba(10, 10, 15, 0.8) 0%,
              rgba(10, 10, 15, 0.4) 30%,
              transparent 100%
            )
          `,
        }}
      />
    </div>
  );
}

export default Fog;
