import { Link } from "react-router-dom";
import { RuledSeparator } from "@/components/ui/academic";
import { Github, Binary } from "lucide-react";

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
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 paper-texture">
      <RuledSeparator spacing="none" variant="default" />
      <div className="container px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Binary className="h-5 w-5 text-primary" />
              <h3 className="font-serif font-bold text-lg gradient-text">
                Based Math Game
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Master base conversion through interactive practice and timed
              quizzes. Challenge yourself and compete with others!
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/hajin-park/based-math-game"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ink-underline"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-serif font-semibold text-sm mb-3 ink-underline-visible">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline"
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

        <RuledSeparator className="my-6" variant="double" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <p className="text-xs text-muted-foreground margin-note">
            © {currentYear} Based Math Game. Open source under GPL-3.0.
          </p>
          <p className="text-xs text-muted-foreground">
            Inspired by{" "}
            <a
              href="https://arithmetic.zetamac.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary link-underline font-medium"
            >
              zetamac
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
