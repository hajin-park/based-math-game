/**
 * Framer Motion Animation Variants - Academic Theme
 *
 * Minimal, purposeful animations for the base conversion quiz game.
 * Academic design philosophy: Subtle, functional, non-intrusive.
 * Focus: clarity, performance, and respecting user preferences.
 */

import { Variants, Transition } from "framer-motion";

// ============================================================================
// TRANSITION PRESETS - Faster, more subtle
// ============================================================================

export const transitions = {
  // Quick transitions for interactive elements
  fast: {
    type: "tween",
    duration: 0.15,
    ease: "easeOut",
  } as Transition,

  // Default smooth transition - very subtle
  smooth: {
    type: "tween",
    duration: 0.2,
    ease: "easeOut",
  } as Transition,
};

// ============================================================================
// FADE ANIMATIONS - Minimal, subtle entrance
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 4 }, /* Very subtle movement */
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

// ============================================================================
// STAGGER ANIMATIONS - For lists and grids (minimal)
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, /* Faster stagger */
      delayChildren: 0.05, /* Shorter delay */
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 4 }, /* Very subtle movement */
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.fast,
  },
};
