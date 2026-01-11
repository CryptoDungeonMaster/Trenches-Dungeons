"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "gold" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-b from-amber-500 to-amber-700 text-black font-bold hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-900/30",
  secondary: "bg-gradient-to-b from-slate-600 to-slate-800 text-white hover:from-slate-500 hover:to-slate-700 shadow-lg shadow-black/30",
  gold: "bg-gradient-to-b from-yellow-400 to-amber-600 text-black font-bold hover:from-yellow-300 hover:to-amber-500 shadow-lg shadow-amber-900/40",
  ghost: "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20",
  danger: "bg-gradient-to-b from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700 shadow-lg shadow-red-900/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, children, className, disabled, icon, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02, y: -1 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all",
          variantStyles[variant],
          sizeStyles[size],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled || isLoading}
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
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
