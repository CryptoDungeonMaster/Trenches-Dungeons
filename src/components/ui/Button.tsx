"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { buttonPress } from "@/lib/motion";

// SVG Icons
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.26l7-3.89v8.63z" />
  </svg>
);

const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.92 5H5l8 8H9.06l-4-4L3 11.06V13h3.94l6 6 2.12-2.12 8-8V7h-1.94L12 16.06 6.92 5z" />
  </svg>
);

const SkullIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 3.69 2.47 6.86 6 8.25V22h8v-1.75c3.53-1.39 6-4.56 6-8.25 0-5.52-4.48-10-10-10zm-2 15h-1v-2h1v2zm6 0h-1v-2h1v2zm2-6c0 .55-.45 1-1 1h-1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1h-4v1c0 .55-.45 1-1 1s-1-.45-1-1v-1H7c-.55 0-1-.45-1-1 0-2.76 2.24-5 5-5h2c2.76 0 5 2.24 5 5z" />
  </svg>
);

type ButtonVariant = "primary" | "gold" | "ghost" | "danger";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  icon?: "shield" | "sword" | "skull" | "none";
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-b from-blood to-blood-dark
    text-parchment
    border-2 border-blood/50
    shadow-ember
    hover:from-blood-light hover:to-blood
    hover:shadow-ember-lg
  `,
  gold: `
    bg-gradient-to-b from-gold-light to-gold
    text-abyss
    border-2 border-gold-pale/50
    shadow-candle
    hover:from-gold-pale hover:to-gold-light
    hover:shadow-candle-lg
  `,
  ghost: `
    bg-transparent
    text-parchment
    border-2 border-parchment/30
    hover:border-parchment/60
    hover:bg-parchment/5
  `,
  danger: `
    bg-gradient-to-b from-mystic to-mystic-dark
    text-parchment
    border-2 border-mystic-light/30
    shadow-[0_0_15px_rgba(74,28,107,0.3)]
    hover:from-mystic-light hover:to-mystic
  `,
};

const iconMap = {
  shield: ShieldIcon,
  sword: SwordIcon,
  skull: SkullIcon,
  none: null,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      icon = "none",
      isLoading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const IconComponent = iconMap[icon];

    return (
      <motion.button
        ref={ref}
        variants={buttonPress}
        initial="idle"
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        className={cn(
          "btn-base",
          "rounded-sm",
          "min-w-[120px]",
          variantStyles[variant],
          disabled && "opacity-50 cursor-not-allowed",
          variant === "primary" && "ember-glow",
          className
        )}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <>
            {IconComponent && <IconComponent />}
            <span>{children}</span>
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
