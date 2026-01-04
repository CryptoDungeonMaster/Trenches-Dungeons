"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cardReveal } from "@/lib/motion";

type PanelVariant = "parchment" | "leather" | "metal" | "stone";

interface PanelProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: PanelVariant;
  animated?: boolean;
  withNoise?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<PanelVariant, string> = {
  parchment: `
    bg-gradient-to-br from-parchment via-parchment to-parchment-dark
    text-abyss
    border-[3px] border-trench-mud
    shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.4)]
  `,
  leather: `
    bg-gradient-to-b from-[#4a3728] via-trench-mud to-[#2d241c]
    text-parchment
    border-2 border-[#5c4a3a]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.5)]
  `,
  metal: `
    bg-gradient-to-b from-trench-stone via-trench-metal to-[#3a3a42]
    text-parchment
    border-2 border-[#6a6a72]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.5)]
  `,
  stone: `
    bg-gradient-to-br from-[#4a4a4a] via-trench-stone to-[#3a3a3a]
    text-parchment
    border-2 border-[#5a5a5a]
    shadow-[inset_0_2px_0_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.6)]
  `,
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      variant = "parchment",
      animated = false,
      withNoise = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const Component = animated ? motion.div : "div";

    const content = (
      <>
        {/* Noise overlay */}
        {withNoise && (
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </>
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          variants={cardReveal}
          initial="hidden"
          animate="visible"
          className={cn(
            "relative overflow-hidden rounded-sm p-4",
            variantStyles[variant],
            className
          )}
          {...(props as HTMLMotionProps<"div">)}
        >
          {content}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-sm p-4",
          variantStyles[variant],
          className
        )}
      >
        {content}
      </div>
    );
  }
);

Panel.displayName = "Panel";

export default Panel;
