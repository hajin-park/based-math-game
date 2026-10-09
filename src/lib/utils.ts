import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default font sizes. Without this, our
 * semantic sizes (`text-label`, `text-body-sm`, …) are mistaken for colours,
 * so `cn("text-label", "text-primary-foreground")` silently drops one of them
 * (e.g. small primary buttons lost their white text).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "headline",
            "title",
            "title-sm",
            "body-lg",
            "body",
            "body-sm",
            "label",
            "eyebrow",
            "mono-sm",
            "mono-md",
            "mono-lg",
            "mono-xl",
            "mono-2xl",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
