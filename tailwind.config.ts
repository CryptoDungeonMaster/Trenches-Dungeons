import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cinzel", "ui-serif", "serif"],
        ui: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        flavor: ["IM Fell English", "ui-serif", "serif"],
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        crimson: ["var(--font-crimson)", "Georgia", "serif"],
      },
      colors: {
        // New premium theme
        bg0: "var(--bg-0)",
        bg1: "var(--bg-1)",
        bg2: "var(--bg-2)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        glass: "var(--glass)",

        gold0: "var(--gold-0)",
        gold1: "var(--gold-1)",
        gold2: "var(--gold-2)",
        gold3: "var(--gold-3)",

        text0: "var(--text-0)",
        text1: "var(--text-1)",
        text2: "var(--text-2)",

        ember: "var(--ember)",
        blood: "var(--blood)",
        venom: "var(--venom)",
        arcane: "var(--arcane)",
        ice: "var(--ice)",
        line: "var(--line)",
        line2: "var(--line-2)",

        // Legacy colors for compatibility
        abyss: {
          DEFAULT: "#0a0a0f",
          light: "#12121a",
          lighter: "#1a1a24",
        },
        gold: {
          dark: "#8b6914",
          DEFAULT: "#b8860b",
          light: "#d4a574",
          pale: "#e8c992",
        },
        mystic: {
          dark: "#2d1040",
          DEFAULT: "#4a1c6b",
          light: "#6b2d9a",
        },
        parchment: {
          dark: "#c4b89a",
          DEFAULT: "#f4e4bc",
          light: "#faf5e8",
        },
        trench: {
          mud: "#3d3226",
          rust: "#8b4513",
          metal: "#4a4a52",
          stone: "#5c5c5c",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
      },
      boxShadow: {
        deep: "var(--shadow)",
        deep2: "var(--shadow-2)",
        candle: "0 4px 20px rgba(184, 134, 11, 0.15), 0 2px 8px rgba(0, 0, 0, 0.5)",
        "candle-lg": "0 8px 40px rgba(184, 134, 11, 0.2), 0 4px 16px rgba(0, 0, 0, 0.6)",
        ember: "0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)",
        glow: "0 0 15px currentColor",
      },
      backgroundImage: {
        "radial-void": "radial-gradient(1200px circle at 50% 0%, rgba(232,207,138,0.08), transparent 55%)",
        "ember-fall": "radial-gradient(2px 2px at 20% 30%, rgba(255,106,61,0.5), transparent 60%)",
        "soot": "linear-gradient(180deg, rgba(7,8,11,0.2), rgba(7,8,11,0.85))",
      },
      keyframes: {
        gateOpen: {
          "0%": { transform: "translateX(0)", filter: "brightness(1)" },
          "60%": { filter: "brightness(1.15)" },
          "100%": { transform: "translateX(var(--gate-shift, -28%))", filter: "brightness(1)" },
        },
        runePulse: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.75" },
        },
        diceTumble: {
          "0%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "25%": { transform: "translateY(-10px) rotate(120deg) scale(1.02)" },
          "55%": { transform: "translateY(6px) rotate(260deg) scale(0.98)" },
          "100%": { transform: "translateY(0) rotate(360deg) scale(1)" },
        },
        slashReveal: {
          "0%": { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          "100%": { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
        },
        emberDrift: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "20%": { opacity: "0.55" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
        hpTick: {
          "0%": { filter: "brightness(1)" },
          "35%": { filter: "brightness(1.35)" },
          "100%": { filter: "brightness(1)" },
        },
        sheenSweep: {
          "0%": { transform: "translateX(-60%) skewX(-12deg)", opacity: "0" },
          "15%": { opacity: "0.22" },
          "65%": { opacity: "0.22" },
          "100%": { transform: "translateX(60%) skewX(-12deg)", opacity: "0" },
        },
        crackGlint: {
          "0%, 100%": { opacity: "0.10", filter: "brightness(1)" },
          "50%": { opacity: "0.38", filter: "brightness(1.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
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
      animation: {
        gateOpen: "gateOpen 820ms cubic-bezier(.2,.9,.2,1) forwards",
        runePulse: "runePulse 2.2s ease-in-out infinite",
        diceTumble: "diceTumble 680ms cubic-bezier(.2,.9,.2,1)",
        slashReveal: "slashReveal 420ms ease-out forwards",
        emberDrift: "emberDrift 1.6s ease-out infinite",
        hpTick: "hpTick 420ms ease-out",
        sheenSweep: "sheenSweep 700ms ease-out",
        crackGlint: "crackGlint 1.6s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
