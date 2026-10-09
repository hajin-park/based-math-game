import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default font sizes, so it treated our
 * semantic sizes (`text-mono-xl`, `text-label`…) as colours and dropped them
 * whenever a colour class followed (e.g. `<Digits>` lost its size). Register
 * them as font sizes.
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
            "fluid-xs",
            "fluid-sm",
            "fluid-base",
            "fluid-lg",
            "fluid-xl",
            "fluid-2xl",
            "fluid-3xl",
            "fluid-4xl",
            "fluid-5xl",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
