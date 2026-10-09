import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";

const SECTIONS = [
  {
    title: "Play",
    links: [
      { name: "Solo sprint", href: "/play" },
      { name: "Multiplayer rooms", href: "/multiplayer" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Your stats", href: "/stats" },
    ],
  },
  {
    title: "Learn",
    links: [
      { name: "Tutorials", href: "/learn" },
      { name: "How to play", href: "/how-to-play" },
      { name: "About", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      {
        name: "GPL-3.0 license",
        href: "https://github.com/hajin-park/based-math-game/blob/main/LICENSE",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8 md:py-16">
        <div className="flex max-w-xs flex-col gap-4">
          <Link
            to="/"
            aria-label="Based Math Game — home"
            className="-ml-1 flex w-fit items-center rounded-md px-1 py-1"
          >
            <Wordmark />
          </Link>
          <p className="text-body-sm text-muted-foreground">
            Timed drills for converting between binary, octal, decimal and
            hexadecimal. Free and open source.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h2 className="eyebrow">{section.title}</h2>
              <ul className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-8 items-center text-body-sm text-foreground/80 transition-colors duration-fast hover:text-foreground"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="inline-flex min-h-8 items-center text-body-sm text-foreground/80 transition-colors duration-fast hover:text-foreground"
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
      </div>

      <div className="container flex flex-col gap-3 border-t py-5 text-[0.8125rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year}{" "}
          <span
            className="font-mono text-[0.75rem]"
            title={`${year} in hexadecimal`}
          >
            (0x{year.toString(16).toUpperCase()})
          </span>{" "}
          Based Math Game · Inspired by{" "}
          <a
            href="https://arithmetic.zetamac.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link font-normal text-muted-foreground"
          >
            zetamac
          </a>
        </p>
        <a
          href="https://github.com/hajin-park/based-math-game"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 w-fit items-center gap-2 transition-colors duration-fast hover:text-foreground"
        >
          <Github className="size-4" aria-hidden />
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
