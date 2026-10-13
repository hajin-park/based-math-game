/**
 * Based Math Game — "Exercise Workbook" design tokens (chalkboard at night).
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
        tint: withAlpha("tint"),
        pen: pair("pen"),
        cover: {
          DEFAULT: withAlpha("cover"),
          deep: withAlpha("cover-deep"),
          foreground: withAlpha("cover-foreground"),
          muted: withAlpha("cover-muted"),
        },
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
        // Computer Modern throughout; see src/styles/fonts.css.
        body: ['"BM Concrete"', '"BM Serif"', "Georgia", "Cambria", "serif"],
        serif: [
          '"BM Serif"',
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "serif",
        ],
        display: ['"BM Serif"', "Georgia", "Cambria", "serif"],
        sans: [
          '"BM Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"BM Typewriter"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        // ---- Semantic scale (preferred) ----
        // Display: BM Serif bold extended — the cover, page titles.
        "display-2xl": [
          "clamp(3.25rem, 1.9rem + 5.2vw, 6rem)",
          { lineHeight: "0.95", letterSpacing: "-0.012em" },
        ],
        "display-xl": [
          "clamp(2.5rem, 1.75rem + 3.2vw, 4.25rem)",
          { lineHeight: "1", letterSpacing: "-0.01em" },
        ],
        "display-lg": [
          "clamp(2rem, 1.55rem + 1.9vw, 3rem)",
          { lineHeight: "1.06", letterSpacing: "-0.008em" },
        ],
        // Headline: chapter and section headings.
        headline: [
          "clamp(1.5rem, 1.28rem + 0.9vw, 2.0625rem)",
          { lineHeight: "1.15", letterSpacing: "-0.005em" },
        ],
        // Title: panel and list titles (serif bold).
        title: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.003em" }],
        "title-sm": ["1.125rem", { lineHeight: "1.35" }],
        // Body: BM Concrete.
        "body-lg": ["1.1875rem", { lineHeight: "1.6" }],
        body: ["1.0625rem", { lineHeight: "1.62" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.55" }],
        // Label: controls, tabs, table heads (BM Sans).
        label: ["0.875rem", { lineHeight: "1.3", letterSpacing: "0.01em" }],
        // Small caps running-head voice (.smallcaps).
        eyebrow: ["0.875rem", { lineHeight: "1.2", letterSpacing: "0.06em" }],
        // Typewriter numerals.
        "mono-sm": ["0.8125rem", { lineHeight: "1.4" }],
        "mono-md": ["0.9375rem", { lineHeight: "1.45" }],
        "mono-lg": ["1.3125rem", { lineHeight: "1.3" }],
        "mono-xl": [
          "clamp(1.625rem, 1.25rem + 1.4vw, 2.5rem)",
          { lineHeight: "1.12" },
        ],
        "mono-2xl": [
          "clamp(2.25rem, 1.5rem + 3vw, 4rem)",
          { lineHeight: "1.04" },
        ],
        "mono-3xl": ["clamp(2.75rem, 1.6rem + 5vw, 6rem)", { lineHeight: "1" }],

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
      // Printed matter has square corners. Every radius is a hair.
      borderRadius: {
        none: "0",
        xs: "1px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
        xl: "4px",
        "2xl": "6px",
      },
      boxShadow: {
        // Paper on paper: a contact shadow plus a soft fall-off. Tinted ink.
        none: "none",
        xs: "0 1px 0 0 rgb(var(--shadow) / 0.05)",
        sm: "0 1px 1px 0 rgb(var(--shadow) / 0.08)",
        DEFAULT:
          "0 1px 1px 0 rgb(var(--shadow) / 0.07), 0 3px 8px -3px rgb(var(--shadow) / 0.12)",
        md: "0 1px 1px 0 rgb(var(--shadow) / 0.08), 0 6px 16px -6px rgb(var(--shadow) / 0.22)",
        lg: "0 1px 2px 0 rgb(var(--shadow) / 0.08), 0 14px 32px -12px rgb(var(--shadow) / 0.32)",
        xl: "0 2px 3px 0 rgb(var(--shadow) / 0.08), 0 24px 48px -18px rgb(var(--shadow) / 0.38)",
        "2xl":
          "0 2px 4px 0 rgb(var(--shadow) / 0.1), 0 32px 64px -22px rgb(var(--shadow) / 0.45)",
        inner: "inset 0 1px 2px 0 rgb(var(--shadow) / 0.08)",
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
        slow: "260ms",
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
        // Pen strokes: SVG paths with pathLength="1".
        "pen-draw": {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
        // A sheet laid down on the desk.
        "sheet-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px) rotate(-0.35deg)",
          },
          to: { opacity: "1", transform: "translateY(0) rotate(0)" },
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
        "pen-draw": "pen-draw 320ms cubic-bezier(0.65, 0, 0.35, 1) both",
        "sheet-in": "sheet-in 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
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
