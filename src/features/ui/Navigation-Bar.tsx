import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/segmented";
import { Wordmark } from "@/components/ui/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, type ThemePreference } from "@/contexts/ThemeContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  {
    name: "Play",
    href: "/play",
    match: ["/play", "/singleplayer", "/quiz", "/results"],
  },
  { name: "Multiplayer", href: "/multiplayer", match: ["/multiplayer"] },
  {
    name: "Learn",
    href: "/learn",
    match: ["/learn", "/tutorials", "/how-to-play"],
  },
  { name: "Leaderboard", href: "/leaderboard", match: ["/leaderboard"] },
];

const SECONDARY_LINKS = [
  { name: "Stats", href: "/stats" },
  { name: "How to play", href: "/how-to-play" },
  { name: "About", href: "/about" },
];

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function useIsActive() {
  const { pathname } = useLocation();
  return (match: string[]) =>
    match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

function ThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Icon = resolvedTheme === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Theme: ${theme}. Change theme`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as ThemePreference)}
        >
          {THEME_OPTIONS.map(({ value, label, icon: ItemIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <ItemIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isGuest } = useAuth();
  const { theme, setTheme } = useTheme();
  const isActive = useIsActive();
  const reduce = useReducedMotion();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color] duration-base",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md backdrop-saturate-150"
          : "border-transparent bg-background",
      )}
    >
      <nav
        aria-label="Main"
        className="container flex h-[var(--nav-h)] items-center gap-6"
      >
        <Link
          to="/"
          aria-label="Based Math Game — home"
          className="-ml-1 flex items-center rounded-md px-1 py-1"
        >
          <Wordmark />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((item) => {
            const active = isActive(item.match);
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-9 items-center rounded-md px-3 text-[0.875rem] font-medium transition-colors duration-fast",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-active"}
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[calc((var(--nav-h)-2.25rem)/2+1px)] h-0.5 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1 lg:flex">
            <ThemeMenu />
            {isGuest ? (
              <Button asChild variant="ghost" size="sm" className="h-9 px-3">
                <Link to="/login">Sign in</Link>
              </Button>
            ) : (
              <ProfileDropdown />
            )}
          </div>

          <Button asChild size="sm" className="h-9 gap-1.5 pl-3.5 pr-3">
            <Link to="/play">
              Play
              <ArrowRight aria-hidden />
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 p-0">
              <SheetHeader className="h-[var(--nav-h)] shrink-0 flex-row items-center gap-0 border-b px-5">
                <SheetTitle asChild>
                  <span className="flex items-center">
                    <Wordmark />
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
              </SheetHeader>

              <nav
                aria-label="Mobile"
                className="flex flex-col overflow-y-auto"
              >
                <ul className="flex flex-col px-3 py-3">
                  {PRIMARY_LINKS.map((item) => {
                    const active = isActive(item.match);
                    return (
                      <li key={item.href}>
                        <NavLink
                          to={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center justify-between rounded-md px-3 font-serif text-[1.375rem] tracking-[-0.01em] transition-colors duration-fast hover:bg-accent",
                            active ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {item.name}
                          {active && (
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-primary"
                            />
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>

                <ul className="flex flex-col border-t px-3 py-3">
                  {SECONDARY_LINKS.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        className="flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground"
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 border-t px-6 py-5">
                  <p className="eyebrow">Appearance</p>
                  <Segmented
                    aria-label="Theme"
                    id="mobile-theme"
                    fullWidth
                    value={theme}
                    onValueChange={setTheme}
                    options={THEME_OPTIONS.map(({ value, label, icon: I }) => ({
                      value,
                      label,
                      icon: <I aria-hidden />,
                    }))}
                  />
                </div>
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {isGuest ? (
                  <>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <p className="text-center text-[0.8125rem] text-muted-foreground">
                      No account needed to play.{" "}
                      <Link to="/signup" className="link">
                        Create one
                      </Link>{" "}
                      to keep your stats.
                    </p>
                  </>
                ) : (
                  <Button asChild variant="outline" size="lg">
                    <Link to="/profile">Your profile</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
