import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/** User preference. "system" follows prefers-color-scheme live. */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  /** The stored preference (light / dark / system). */
  theme: ThemePreference;
  /** What is actually painted right now. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Flip between light and dark (sets an explicit preference). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

const STORAGE_KEY = "theme";
const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#F3F0E8",
  dark: "#12110F",
};
const DARK_QUERY = "(prefers-color-scheme: dark)";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

function isPreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readPreference(): ThemePreference {
  try {
    const cookie = getCookie(STORAGE_KEY);
    if (isPreference(cookie)) return cookie;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isPreference(stored)) return stored;
  } catch {
    // Storage unavailable (private mode etc.) — fall through.
  }
  return "system";
}

function systemTheme(): ResolvedTheme {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: ResolvedTheme, pref: ThemePreference) {
  const root = document.documentElement;
  // Suppress transitions for the frame in which the palette swaps.
  root.classList.add("theme-switching");
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      if (pref === "system") {
        const media = meta.getAttribute("media") ?? "";
        meta.content = media.includes("dark")
          ? THEME_COLORS.dark
          : THEME_COLORS.light;
      } else {
        meta.content = THEME_COLORS[resolved];
      }
    });
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() =>
      root.classList.remove("theme-switching"),
    ),
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(readPreference);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

  // Follow OS changes live.
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? system : theme;

  useEffect(() => {
    applyTheme(resolvedTheme, theme);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      const consent = localStorage.getItem("cookieConsent");
      if (consent && JSON.parse(consent)?.functional) {
        setCookie(STORAGE_KEY, theme, 365);
      }
    } catch {
      // Ignore storage / consent parse errors.
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
