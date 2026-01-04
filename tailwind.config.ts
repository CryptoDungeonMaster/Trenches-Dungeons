import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep blacks
        abyss: {
          DEFAULT: "#0a0a0f",
          light: "#12121a",
          lighter: "#1a1a24",
        },
        // Blood reds
        blood: {
          dark: "#8b0000",
          DEFAULT: "#dc2626",
          light: "#ef4444",
          glow: "rgba(220, 38, 38, 0.4)",
        },
        // Tarnished golds
        gold: {
          dark: "#8b6914",
          DEFAULT: "#b8860b",
          light: "#d4a574",
          pale: "#e8c992",
          glow: "rgba(184, 134, 11, 0.4)",
        },
        // Muted purples
        mystic: {
          dark: "#2d1040",
          DEFAULT: "#4a1c6b",
          light: "#6b2d9a",
        },
        // Parchment
        parchment: {
          dark: "#c4b89a",
          DEFAULT: "#f4e4bc",
          light: "#faf5e8",
        },
        // UI colors
        trench: {
          mud: "#3d3226",
          rust: "#8b4513",
          metal: "#4a4a52",
          stone: "#5c5c5c",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "Georgia", "serif"],
      },
      boxShadow: {
        // Candle-like shadows
        candle: "0 4px 20px rgba(184, 134, 11, 0.15), 0 2px 8px rgba(0, 0, 0, 0.5)",
        "candle-lg": "0 8px 40px rgba(184, 134, 11, 0.2), 0 4px 16px rgba(0, 0, 0, 0.6)",
        ember: "0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)",
        "ember-lg": "0 0 30px rgba(220, 38, 38, 0.5), 0 0 60px rgba(220, 38, 38, 0.3)",
        inset: "inset 0 2px 8px rgba(0, 0, 0, 0.5)",
        "inset-lg": "inset 0 4px 16px rgba(0, 0, 0, 0.6)",
        glow: "0 0 15px currentColor",
      },
      borderRadius: {
        weathered: "2px 4px 3px 5px",
      },
      backgroundImage: {
        "parchment-texture": `
          linear-gradient(135deg, rgba(244, 228, 188, 0.03) 25%, transparent 25%),
          linear-gradient(225deg, rgba(244, 228, 188, 0.03) 25%, transparent 25%),
          linear-gradient(45deg, rgba(244, 228, 188, 0.03) 25%, transparent 25%),
          linear-gradient(315deg, rgba(244, 228, 188, 0.03) 25%, transparent 25%)
        `,
        "leather-texture": `
          radial-gradient(ellipse at 20% 80%, rgba(61, 50, 38, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(61, 50, 38, 0.3) 0%, transparent 50%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)
        `,
        "metal-texture": `
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        "stone-texture": `
          radial-gradient(ellipse at 30% 30%, rgba(92, 92, 92, 0.3) 0%, transparent 40%),
          radial-gradient(ellipse at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 40%)
        `,
      },
      animation: {
        "torch-flicker": "torchFlicker 0.5s ease-in-out infinite alternate",
        "fog-drift": "fogDrift 20s linear infinite",
        "fog-drift-slow": "fogDrift 30s linear infinite reverse",
        "dust-float": "dustFloat 8s ease-in-out infinite",
        "ember-pulse": "emberPulse 2s ease-in-out infinite",
        "parchment-ripple": "parchmentRipple 4s ease-in-out infinite",
        typewriter: "typewriter 2s steps(40) forwards",
        "liquid-fill": "liquidFill 0.5s ease-out forwards",
        shake: "shake 0.3s ease-in-out",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        torchFlicker: {
          "0%": { opacity: "0.9", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.1)" },
          "100%": { opacity: "0.85", filter: "brightness(0.95)" },
        },
        fogDrift: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        dustFloat: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-5px)" },
          "75%": { transform: "translateY(-30px) translateX(15px)" },
        },
        emberPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(220, 38, 38, 0.6)" },
        },
        parchmentRipple: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.002)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        liquidFill: {
          from: { height: "0%" },
          to: { height: "var(--fill-height)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
