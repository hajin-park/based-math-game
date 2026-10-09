/**
 * Based Math Game — "Engineer's Notebook" design tokens.
 * Colors are RGB channel triplets declared in src/index.css so that every
 * Tailwind opacity modifier works (bg-primary/10, border-base-bin/30, …).
 * See DESIGN.md for usage rules.
 *
 * @type {import('tailwindcss').Config}
 */
const withAlpha = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const pair = (name) => ({
  DEFAULT: withAlpha(name),
  foreground: withAlpha(`${name}-foreground`),
});

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1240px",
      },
    },
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        border: withAlpha("border"),
        "border-strong": withAlpha("border-strong"),
        input: withAlpha("input"),
        ring: withAlpha("ring"),
        background: withAlpha("background"),
        foreground: withAlpha("foreground"),
        surface: withAlpha("card"),
        sunken: withAlpha("sunken"),
        primary: {
          ...pair("primary"),
          hover: withAlpha("primary-hover"),
        },
        secondary: pair("secondary"),
        destructive: pair("destructive"),
        success: pair("success"),
        warning: pair("warning"),
        info: pair("info"),
        muted: pair("muted"),
        accent: pair("accent"),
        popover: pair("popover"),
        card: pair("card"),
        highlight: withAlpha("highlight"),
        chart: {
          1: withAlpha("chart-1"),
          2: withAlpha("chart-2"),
          3: withAlpha("chart-3"),
          4: withAlpha("chart-4"),
          5: withAlpha("chart-5"),
        },
        // Number-base identity colours. Use for any number shown in a base.
        "base-bin": pair("base-bin"),
        "base-oct": pair("base-oct"),
        "base-dec": pair("base-dec"),
        "base-hex": pair("base-hex"),
        trophy: pair("trophy"),
      },
      fontFamily: {
        sans: [
          '"Schibsted Grotesk"',
          '"Schibsted Grotesk Fallback"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          '"Newsreader Fallback"',
          "Georgia",
          "Cambria",
          "serif",
        ],
        display: [
          "Newsreader",
          '"Newsreader Fallback"',
          "Georgia",
          "Cambria",
          "serif",
        ],
        mono: [
          '"Martian Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        // ---- Semantic scale (preferred) ----
        // Display: Newsreader, for page heroes only.
        "display-2xl": [
          "clamp(2.75rem, 1.6rem + 4.6vw, 5.25rem)",
          { lineHeight: "0.98", letterSpacing: "-0.028em" },
        ],
        "display-xl": [
          "clamp(2.25rem, 1.5rem + 3vw, 3.75rem)",
          { lineHeight: "1.02", letterSpacing: "-0.024em" },
        ],
        "display-lg": [
          "clamp(1.875rem, 1.45rem + 1.7vw, 2.75rem)",
          { lineHeight: "1.08", letterSpacing: "-0.018em" },
        ],
        // Headline: Newsreader, section headings.
        headline: [
          "clamp(1.5rem, 1.3rem + 0.8vw, 2rem)",
          { lineHeight: "1.15", letterSpacing: "-0.012em" },
        ],
        // Title: Schibsted, card / panel titles.
        title: ["1.1875rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "title-sm": [
          "1.0625rem",
          { lineHeight: "1.4", letterSpacing: "-0.006em" },
        ],
        // Body.
        "body-lg": [
          "1.125rem",
          { lineHeight: "1.6", letterSpacing: "-0.003em" },
        ],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        // Label: UI controls, table headers.
        label: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.005em" }],
        // Eyebrow: Martian Mono uppercase overline.
        eyebrow: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.08em" }],
        // Mono numerals.
        "mono-sm": ["0.75rem", { lineHeight: "1.4" }],
        "mono-md": ["0.875rem", { lineHeight: "1.45" }],
        "mono-lg": ["1.25rem", { lineHeight: "1.3" }],
        "mono-xl": [
          "clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)",
          { lineHeight: "1.15" },
        ],
        "mono-2xl": [
          "clamp(2rem, 1.4rem + 2.6vw, 3.5rem)",
          { lineHeight: "1.05" },
        ],

        // ---- Tailwind defaults with tightened line-heights (legacy) ----
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.25rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.3rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.6rem" }],
        "5xl": ["3rem", { lineHeight: "1.08" }],
        "6xl": ["3.75rem", { lineHeight: "1.04" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      letterSpacing: {
        tightest: "-0.03em",
        body: "0",
        caps: "0.08em",
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        88: "22rem",
        128: "32rem",
        // Section rhythm
        section: "clamp(4rem, 2.75rem + 4.5vw, 6.5rem)",
        "section-sm": "clamp(2.5rem, 1.75rem + 3vw, 4.5rem)",
      },
      maxWidth: {
        content: "65ch",
        prose: "68ch",
        lede: "34rem",
        page: "1240px",
      },
      borderRadius: {
        none: "0",
        xs: "3px",
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
      },
      boxShadow: {
        // Hairline + very soft ambient. Shadow colour is tinted ink.
        none: "none",
        xs: "0 1px 0 0 rgb(var(--shadow) / 0.04)",
        sm: "0 1px 2px 0 rgb(var(--shadow) / 0.06)",
        DEFAULT:
          "0 1px 2px 0 rgb(var(--shadow) / 0.05), 0 2px 6px -2px rgb(var(--shadow) / 0.06)",
        md: "0 1px 2px 0 rgb(var(--shadow) / 0.06), 0 6px 16px -6px rgb(var(--shadow) / 0.12)",
        lg: "0 1px 2px 0 rgb(var(--shadow) / 0.06), 0 12px 32px -10px rgb(var(--shadow) / 0.18)",
        xl: "0 2px 4px 0 rgb(var(--shadow) / 0.06), 0 24px 56px -16px rgb(var(--shadow) / 0.24)",
        "2xl":
          "0 2px 4px 0 rgb(var(--shadow) / 0.08), 0 32px 72px -20px rgb(var(--shadow) / 0.3)",
        inner: "inset 0 1px 2px 0 rgb(var(--shadow) / 0.06)",
        hairline: "0 0 0 1px rgb(var(--border))",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.4, 0.64, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "240ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        rise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "accordion-up": "accordion-up 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "fade-in": "fade-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "fade-out": "fade-out 120ms ease-in",
        rise: "rise 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "caret-blink": "caret-blink 1.1s ease-out infinite",
        "slide-in-from-top":
          "slide-in-from-top 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-from-bottom":
          "slide-in-from-bottom 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-from-left":
          "slide-in-from-left 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-from-right":
          "slide-in-from-right 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addVariant }) {
      addVariant("pointer-coarse", "@media (pointer: coarse)");
      addVariant("pointer-fine", "@media (pointer: fine)");
      addVariant("motion-ok", "@media (prefers-reduced-motion: no-preference)");
    },
  ],
};
