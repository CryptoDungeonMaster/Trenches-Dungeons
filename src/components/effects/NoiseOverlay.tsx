"use client";

import { cn } from "@/lib/utils";

interface NoiseOverlayProps {
  opacity?: number;
  className?: string;
}

export function NoiseOverlay({ opacity = 0.03, className }: NoiseOverlayProps) {
  // Base64 encoded tiny noise SVG
  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none mix-blend-overlay",
        className
      )}
      style={{
        backgroundImage: noiseSvg,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

export default NoiseOverlay;
