import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

/**
 * Fonts that render above the fold on first paint. They are preloaded from
 * index.html so the hero headline and UI text do not wait for the CSS to be
 * parsed. Keep in sync with src/styles/fonts.css.
 */
const CRITICAL_FONTS = [
  "src/styles/fonts/bm-concrete-500.woff2",
  "src/styles/fonts/bm-serif-700.woff2",
  "src/styles/fonts/bm-sans-700.woff2",
  "src/styles/fonts/bm-typewriter-500.woff2",
];

function preloadFonts(): Plugin {
  let isBuild = false;
  return {
    name: "preload-fonts",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const hrefs: string[] = [];
        if (isBuild && ctx.bundle) {
          for (const spec of CRITICAL_FONTS) {
            const base = path.basename(spec, ".woff2");
            // Emitted as `<name>-<8-char hash>.woff2`; match the length too so
            // "bm-concrete-500" never picks "bm-concrete-500-italic".
            const asset = Object.values(ctx.bundle).find((chunk) => {
              if (chunk.type !== "asset" || !chunk.fileName.endsWith(".woff2"))
                return false;
              const name = path.basename(chunk.fileName, ".woff2");
              return (
                name.startsWith(`${base}-`) && name.length === base.length + 9
              );
            });
            if (asset) hrefs.push(`/${asset.fileName}`);
          }
        } else {
          for (const spec of CRITICAL_FONTS) {
            hrefs.push(`/${spec}`);
          }
        }
        return hrefs.map((href) => ({
          tag: "link",
          attrs: {
            rel: "preload",
            href,
            as: "font",
            type: "font/woff2",
            crossorigin: "",
          },
          injectTo: "head-prepend" as const,
        }));
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), preloadFonts()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
