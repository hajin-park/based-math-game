import { useMediaQuery } from "@/features/play/useMediaQuery";

/** True when the user asked the OS for less motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
