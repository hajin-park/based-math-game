/** Navigation data shared by the running head, the menu and the cover. */
import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemePreference } from "@/contexts/ThemeContext";

/** The book's running head: five sections, set in small caps. */
export const PRIMARY_LINKS = [
  { name: "Play", href: "/play", match: ["/play", "/results"] },
  { name: "Daily", href: "/daily", match: ["/daily"] },
  {
    name: "Multiplayer",
    href: "/multiplayer",
    match: ["/multiplayer", "/join"],
  },
  {
    name: "Learn",
    href: "/learn",
    match: ["/learn", "/tutorials", "/how-to-play"],
  },
  { name: "Leaderboard", href: "/leaderboard", match: ["/leaderboard"] },
];

export const SECONDARY_LINKS = [
  { name: "Your stats", href: "/stats" },
  { name: "How to play", href: "/how-to-play" },
  { name: "About", href: "/about" },
];

export const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Paper", icon: Sun },
  { value: "dark", label: "Chalkboard", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];
