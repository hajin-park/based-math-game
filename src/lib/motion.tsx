import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";

/**
 * Motion is only used for small flourishes (sliding active indicators,
 * scoreboard reordering), so its animation engine is not worth shipping in
 * the entry chunk. Components render `m.*` elements, which behave as plain
 * elements until the features chunk arrives a moment after first paint.
 * `strict` makes a stray `motion.*` import fail loudly in development.
 */
const loadFeatures = () =>
  import("./motionFeatures").then((module) => module.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
