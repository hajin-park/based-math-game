import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";

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
import { PRIMARY_LINKS, SECONDARY_LINKS, THEME_OPTIONS } from "./nav";

function useIsActive() {
  const { pathname } = useLocation();
  return (match: string[]) =>
    match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export function ThemeMenu({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Icon = resolvedTheme === "dark" ? Moon : Sun;
  const label = THEME_OPTIONS.find((o) => o.value === theme)?.label ?? theme;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Theme: ${label}. Change theme`}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            className,
          )}
        >
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
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

/** The mobile index: every section, the extras, theme and account. */
export function SiteMenu({
  triggerClassName,
  triggerLabel,
}: {
  triggerClassName?: string;
  /** Show a visible "Menu" label next to the icon (the cover uses it). */
  triggerLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { isGuest } = useAuth();
  const { theme, setTheme } = useTheme();
  const isActive = useIsActive();
  const { pathname } = useLocation();

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={triggerLabel ? "sm" : "icon"}
          className={cn(triggerLabel && "gap-2 px-2.5", triggerClassName)}
          aria-label="Open menu"
        >
          <Menu />
          {triggerLabel && (
            <span
              aria-hidden
              className="smallcaps text-[0.9375rem] text-current"
            >
              Menu
            </span>
          )}
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

        <nav aria-label="Menu" className="flex flex-col overflow-y-auto">
          <p className="smallcaps px-6 pb-1 pt-5">Contents</p>
          <ol className="flex flex-col px-3 pb-3">
            {PRIMARY_LINKS.map((item, i) => {
              const active = isActive(item.match);
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-baseline gap-3 rounded-sm px-3 py-2.5 font-serif text-[1.375rem] font-bold transition-colors duration-fast hover:bg-accent",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    <span className="w-5 font-mono text-[0.875rem] font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ol>

          <ul className="flex flex-col border-t px-3 py-3">
            {SECONDARY_LINKS.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className="flex min-h-11 items-center rounded-sm px-3 text-[1rem] text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground"
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t px-6 py-5">
            <p className="smallcaps">Appearance</p>
            <Segmented
              aria-label="Theme"
              id="menu-theme"
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
              <p className="text-center text-[0.9375rem] text-muted-foreground">
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
  );
}

/**
 * The running head printed across every inside page: the title on the left,
 * the five sections in small caps, and theme + account on the right.
 */
export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const { isGuest } = useAuth();
  const isActive = useIsActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background transition-[box-shadow] duration-base",
        scrolled
          ? "shadow-[0_1px_0_rgb(var(--foreground)/0.18),0_6px_14px_-12px_rgb(var(--shadow)/0.5)]"
          : "shadow-[0_1px_0_rgb(var(--foreground)/0.12)]",
      )}
    >
      <nav
        aria-label="Main"
        className="container flex h-[var(--nav-h)] items-center gap-6"
      >
        <Link
          to="/"
          aria-label="Based Math Game — cover"
          className="-ml-1 flex items-center rounded-sm px-1 py-1"
        >
          <Wordmark />
        </Link>

        {/* Desktop sections */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY_LINKS.map((item) => {
            const active = isActive(item.match);
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-9 items-center px-3 font-serif text-[1.0625rem] transition-colors duration-fast [font-variant-caps:all-small-caps] [letter-spacing:0.05em]",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-0.5 h-[2px] bg-primary"
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

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 lg:hidden"
          >
            <Link to="/play">Play</Link>
          </Button>

          <SiteMenu triggerClassName="-mr-2 lg:hidden" />
        </div>
      </nav>
    </header>
  );
}
