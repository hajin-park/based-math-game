import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Sparkles } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: "Learn",
            links: [
                { name: "Tutorials", href: "/tutorials" },
                { name: "How to Play", href: "/how-to-play" },
                { name: "About", href: "/about" },
            ],
        },
        {
            title: "Play",
            links: [
                { name: "Singleplayer", href: "/singleplayer" },
                { name: "Multiplayer", href: "/multiplayer" },
                { name: "Leaderboard", href: "/leaderboard" },
                { name: "Stats", href: "/stats" },
            ],
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                {
                    name: "License (GPL-3.0)",
                    href: "https://github.com/hajin-park/based-math-game/blob/main/LICENSE",
                    external: true
                },
            ],
        },
    ];

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg gradient-text">
                                Based Math Game
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Master base conversion through interactive practice and timed quizzes. Challenge yourself and compete with others!
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/hajin-park/based-math-game"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                aria-label="GitHub Repository"
                            >
                                <Github className="h-5 w-5" />
                                <span>View on GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold text-sm mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                to={link.href}
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-8" />

                {/* Bottom Section */}
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} Based Math Game. Open source under GPL-3.0.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Inspired by{' '}
                        <a
                            href="https://arithmetic.zetamac.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                        >
                            zetamac
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
