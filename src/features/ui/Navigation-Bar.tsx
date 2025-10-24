import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Menu, Binary, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Play", href: "/singleplayer" },
    { name: "Multiplayer", href: "/multiplayer" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Stats", href: "/stats" },
    { name: "How to Play", href: "/how-to-play" },
    { name: "Tutorials", href: "/tutorials" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled past threshold
      setScrolled(currentScrollY > 10);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - immediately show nav
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <motion.nav
        initial={false}
        animate={{
          y: scrollDirection === "down" && scrolled ? -100 : 0,
        }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "w-full border-b transition-all duration-300",
          scrolled && scrollDirection === "down"
            ? "bg-background/40 backdrop-blur-md border-border/30"
            : "bg-background/95 backdrop-blur-lg border-border/50",
          scrolled && "shadow-sm",
          // Academic paper-like styling
          "paper-texture",
        )}
      >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <Binary className="h-5 w-5 text-primary" />
            <span className="gradient-text hidden sm:inline">
              Based Math Game
            </span>
            <span className="gradient-text sm:hidden">BMG</span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-md",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-x-1 -bottom-px h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth & Theme Toggle */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            <AnimatePresence mode="wait">
              {theme === "light" ? (
                <motion.div
                  key="moon"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {isGuest ? (
            <Button asChild size="sm">
              <NavLink to="/signup">Sign Up</NavLink>
            </Button>
          ) : (
            <ProfileDropdown />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Binary className="h-5 w-5 text-primary" />
                  <span className="gradient-text">Based Math Game</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </nav>

                <Separator />

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  )}
                </Button>

                <Separator />

                {/* Auth Section */}
                <div className="flex flex-col gap-2">
                  {isGuest ? (
                    <Button asChild className="w-full">
                      <NavLink
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </NavLink>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <NavLink
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </NavLink>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
    </div>
  );
}
