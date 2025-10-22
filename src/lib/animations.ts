/**
 * Framer Motion Animation Variants
 *
 * Minimal, purposeful animations for the base conversion quiz game.
 * Focus: clarity, performance, and respecting user preferences.
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  // Snappy transitions for interactive elements
  fast: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Default smooth transition
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  } as Transition,
};

// ============================================================================
// FADE ANIMATIONS - Minimal set for page/component entry
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};



// ============================================================================
// STAGGER ANIMATIONS - For lists and grids
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

