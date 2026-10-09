import * as React from "react";
import { useLocation } from "react-router-dom";

/**
 * Tracks which section is under the sticky nav. A section is "current" once
 * its top has scrolled above a line just below the nav.
 */
export function useScrollSpy(ids: readonly string[]): string {
  const [active, setActive] = React.useState(ids[0] ?? "");
  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - line <= 0) current = id;
        else break;
      }
      // At the very bottom the last short sections can never reach the line.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        current = ids[ids.length - 1] ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);
  return active;
}

/** Scroll to a section (respecting scroll-margin) and move focus to its heading. */
export function scrollToSection(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  const heading = el.querySelector<HTMLElement>("h2, h3");
  if (heading) {
    if (!heading.hasAttribute("tabindex"))
      heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
}

/**
 * Deep links: scroll to `location.hash` once the page has rendered. Runs again
 * after web fonts load, since font swaps shift every section down.
 */
export function useHashScroll() {
  const { hash } = useLocation();
  React.useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id) return;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
    };
    // After Layout's scroll-to-top and our own first paint.
    const raf = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(go),
    );
    const timer = window.setTimeout(go, 350);
    document.fonts?.ready.then(go).catch(() => undefined);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [hash]);
}
