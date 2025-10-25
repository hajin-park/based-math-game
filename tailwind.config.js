/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem" /* Compact margins for better density */,
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
        "2xl": "4rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        trophy: {
          DEFAULT: "var(--trophy)",
          foreground: "var(--trophy-foreground)",
        },
        critical: {
          DEFAULT: "var(--critical)",
          foreground: "var(--critical-foreground)",
        },
        "base-binary": {
          DEFAULT: "var(--base-binary)",
          foreground: "var(--base-binary-foreground)",
        },
        "base-octal": {
          DEFAULT: "var(--base-octal)",
          foreground: "var(--base-octal-foreground)",
        },
        "base-decimal": {
          DEFAULT: "var(--base-decimal)",
          foreground: "var(--base-decimal-foreground)",
        },
        "base-hex": {
          DEFAULT: "var(--base-hex)",
          foreground: "var(--base-hex-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)" /* 2px - very subtle */,
        md: "0.1875rem" /* 3px - slightly more rounded */,
        sm: "0.125rem" /* 2px - minimal */,
        xl: "0.25rem" /* 4px - for special cases */,
        "2xl": "0.375rem" /* 6px - rarely used */,
        none: "0" /* Sharp corners for academic look */,
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }] /* Academic line-height */,
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.7" }] /* Optimal for reading */,
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.25rem", { lineHeight: "1.6" }],
        "2xl": ["1.5rem", { lineHeight: "1.5" }],
        "3xl": ["1.875rem", { lineHeight: "1.4" }],
        "4xl": ["2.25rem", { lineHeight: "1.3" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
        /* Fluid typography using clamp() for responsive design */
        "fluid-xs": [
          "clamp(0.7rem, 0.5vw + 0.6rem, 0.75rem)",
          { lineHeight: "1.5" },
        ],
        "fluid-sm": [
          "clamp(0.8rem, 0.5vw + 0.7rem, 0.875rem)",
          { lineHeight: "1.6" },
        ],
        "fluid-base": [
          "clamp(0.9rem, 0.5vw + 0.8rem, 1rem)",
          { lineHeight: "1.7" },
        ],
        "fluid-lg": [
          "clamp(1rem, 0.5vw + 0.9rem, 1.125rem)",
          { lineHeight: "1.7" },
        ],
        "fluid-xl": [
          "clamp(1.125rem, 0.5vw + 1rem, 1.25rem)",
          { lineHeight: "1.6" },
        ],
        "fluid-2xl": [
          "clamp(1.25rem, 1vw + 1rem, 1.5rem)",
          { lineHeight: "1.5" },
        ],
        "fluid-3xl": [
          "clamp(1.5rem, 1.5vw + 1rem, 1.875rem)",
          { lineHeight: "1.4" },
        ],
        "fluid-4xl": [
          "clamp(1.875rem, 2vw + 1rem, 2.25rem)",
          { lineHeight: "1.3" },
        ],
        "fluid-5xl": [
          "clamp(2.25rem, 3vw + 1rem, 3rem)",
          { lineHeight: "1.2" },
        ],
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Crimson Pro", "Crimson Text", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        /* Fluid spacing utilities using clamp() for responsive design */
        "fluid-xs": "clamp(0.25rem, 0.5vw, 0.5rem)" /* 4px - 8px */,
        "fluid-sm": "clamp(0.5rem, 1vw, 1rem)" /* 8px - 16px */,
        "fluid-md": "clamp(0.75rem, 1.5vw, 1.5rem)" /* 12px - 24px */,
        "fluid-lg": "clamp(1rem, 2vw, 2rem)" /* 16px - 32px */,
        "fluid-xl": "clamp(1.5rem, 3vw, 3rem)" /* 24px - 48px */,
        "fluid-2xl": "clamp(2rem, 4vw, 4rem)" /* 32px - 64px */,
        "fluid-3xl": "clamp(3rem, 6vw, 6rem)" /* 48px - 96px */,
      },
      maxWidth: {
        content: "65ch" /* Academic optimal reading width */,
        prose: "75ch" /* Slightly wider for prose */,
      },
      letterSpacing: {
        academic: "-0.02em" /* For headings */,
        body: "0.01em" /* For body text */,
      },
      boxShadow: {
        /* Minimal shadows - paper-like, flat design */
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.03)" /* Very subtle */,
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.05)" /* Subtle paper lift */,
        md: "0 2px 4px 0 rgb(0 0 0 / 0.06)" /* Slightly elevated */,
        lg: "0 4px 8px 0 rgb(0 0 0 / 0.08)" /* More elevated */,
        xl: "0 8px 16px 0 rgb(0 0 0 / 0.10)" /* Highest elevation */,
        "2xl": "0 12px 24px 0 rgb(0 0 0 / 0.12)" /* Maximum elevation */,
        inner: "inset 0 1px 2px 0 rgb(0 0 0 / 0.04)" /* Subtle inset */,
        none: "none" /* No shadow for flat design */,
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "fade-out": {
          from: {
            opacity: "1",
          },
          to: {
            opacity: "0",
          },
        },
        "slide-in-from-top": {
          from: {
            transform: "translateY(-100%)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        "slide-in-from-bottom": {
          from: {
            transform: "translateY(100%)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        "slide-in-from-left": {
          from: {
            transform: "translateX(-100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "slide-in-from-right": {
          from: {
            transform: "translateX(100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
