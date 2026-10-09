import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

/**
 * Fonts that render above the fold on first paint. They are preloaded from
 * index.html so the hero headline and UI text do not wait for the CSS to be
 * parsed. Keep in sync with src/styles/fonts.css.
 */
const CRITICAL_FONTS = [
  "@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2",
  "@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2",
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
            const asset = Object.values(ctx.bundle).find(
              (chunk) =>
                chunk.type === "asset" &&
                chunk.fileName.endsWith(".woff2") &&
                path.basename(chunk.fileName).startsWith(`${base}-`),
            );
            if (asset) hrefs.push(`/${asset.fileName}`);
          }
        } else {
          for (const spec of CRITICAL_FONTS) {
            hrefs.push(`/node_modules/${spec}`);
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
