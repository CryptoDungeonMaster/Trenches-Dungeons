import { Variants, Transition } from "framer-motion";

// ========================================
// TRANSITION PRESETS
// ========================================

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const smoothTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

export const slowTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.6,
};

// ========================================
// PAGE TRANSITIONS
// ========================================

export const pageFadeThrough: Variants = {
  initial: {
    opacity: 0,
    filter: "brightness(0)",
  },
  animate: {
    opacity: 1,
    filter: "brightness(1)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    filter: "brightness(0)",
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

export const pageSlideUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// ========================================
// DOOR ANIMATIONS
// ========================================

export const doorCreakOpen: Variants = {
  closed: {
    rotateY: 0,
    boxShadow: "inset -10px 0 20px rgba(0, 0, 0, 0.5)",
  },
  hover: {
    rotateY: -12,
    boxShadow: "inset -20px 0 30px rgba(0, 0, 0, 0.6)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  open: {
    rotateY: -85,
    boxShadow: "inset -30px 0 40px rgba(0, 0, 0, 0.8)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
      duration: 0.8,
    },
  },
};

export const doorDustParticles: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
    y: 0,
  },
  animate: {
    opacity: [0, 0.6, 0],
    scale: [0.5, 1, 0.8],
    y: -40,
    x: [0, 10, -5, 15],
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

// ========================================
// DICE ROLL ANIMATION
// ========================================

export const diceRoll: Variants = {
  idle: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  },
  rolling: {
    rotateX: [0, 720, 1080, 1440, 1620],
    rotateY: [0, -360, -720, -900, -990],
    rotateZ: [0, 180, 360, 450, 540],
    transition: {
      duration: 1.5,
      ease: [0.25, 0.1, 0.25, 1],
      times: [0, 0.3, 0.6, 0.85, 1],
    },
  },
  settled: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

// ========================================
// CHEST OPEN ANIMATION
// ========================================

export const chestLidOpen: Variants = {
  closed: {
    rotateX: 0,
    y: 0,
  },
  open: {
    rotateX: -110,
    y: -10,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 10,
    },
  },
};

export const chestParticles: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    y: 0,
  },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1.2, 0.8],
    y: [-20, -60 - i * 10, -100],
    x: [(i - 2) * 20, (i - 2) * 30, (i - 2) * 25],
    transition: {
      duration: 1.2,
      delay: i * 0.1,
      ease: "easeOut",
    },
  }),
};

// ========================================
// HUD ANIMATIONS
// ========================================

export const hudDamageShake: Variants = {
  idle: {
    x: 0,
    rotate: 0,
  },
  damage: {
    x: [0, -5, 5, -5, 5, -3, 3, 0],
    rotate: [0, -1, 1, -1, 1, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

export const hudPulse: Variants = {
  idle: {
    scale: 1,
    filter: "brightness(1)",
  },
  pulse: {
    scale: [1, 1.05, 1],
    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
    transition: {
      duration: 0.3,
    },
  },
};

// ========================================
// BUTTON ANIMATIONS
// ========================================

export const buttonPress: Variants = {
  idle: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    y: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// ========================================
// CARD / PANEL ANIMATIONS
// ========================================

export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

export const scrollUnfurl: Variants = {
  rolled: {
    scaleY: 0,
    opacity: 0,
    originY: 0,
  },
  unfurled: {
    scaleY: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

// ========================================
// STAGGER CHILDREN
// ========================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// ========================================
// MODAL ANIMATIONS
// ========================================

export const modalBackdrop: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================================
// TYPEWRITER ANIMATION
// ========================================

export const typewriterContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const typewriterChar: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};
