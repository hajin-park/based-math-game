import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Menu, Sparkles } from "lucide-react";

export default function NavigationBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isGuest } = useAuth();

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Play", href: "/singleplayer" },
        { name: "Multiplayer", href: "/multiplayer" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Stats", href: "/stats" },
        { name: "How to Play", href: "/how-to-play" },
        { name: "Tutorials", href: "/tutorials" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <NavLink to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="gradient-text hidden sm:inline">
                            Based Math Game
                        </span>
                        <span className="gradient-text sm:hidden">
                            BMG
                        </span>
                    </NavLink>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:items-center lg:gap-6">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-primary ${
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* Desktop Auth */}
                <div className="hidden lg:flex lg:items-center lg:gap-4">
                    {isGuest ? (
                        <Button asChild size="sm" className="shadow-sm">
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
                                <SheetTitle className="text-left">
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
                                                `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                                                    isActive
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`
                                            }
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </nav>

                                <Separator />

                                {/* Auth Section */}
                                <div className="flex flex-col gap-2">
                                    {isGuest ? (
                                        <Button asChild className="w-full">
                                            <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                                Sign Up
                                            </NavLink>
                                        </Button>
                                    ) : (
                                        <Button asChild variant="outline" className="w-full">
                                            <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
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
        </nav>
    );
}
