import { Link } from "react-router-dom";

const LINKS = [
  { name: "About", href: "/about" },
  { name: "How to play", href: "/how-to-play" },
  { name: "Your stats", href: "/stats" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

const EXTERNAL = [
  {
    name: "Source",
    href: "https://github.com/hajin-park/based-math-game",
  },
  {
    name: "GPL-3.0",
    href: "https://github.com/hajin-park/based-math-game/blob/main/LICENSE",
  },
];

/**
 * The colophon: one quiet block at the back of the book. What it is, what it
 * is set in, where the source lives.
 */
export default function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={className}>
      <div className="container">
        <div className="flex flex-col gap-4 border-t-[3px] border-double border-foreground/40 py-8 text-[0.9375rem] text-muted-foreground md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="max-w-[34rem] text-pretty">
            <span className="font-serif font-bold text-foreground">
              Based Math
            </span>{" "}
            — timed drills in binary, octal, decimal and hexadecimal. Set in
            Computer Modern. Inspired by{" "}
            <a
              href="https://arithmetic.zetamac.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link font-normal text-muted-foreground"
            >
              zetamac
            </a>
            .{" "}
            <span className="whitespace-nowrap">
              © {year}{" "}
              <span
                className="font-mono text-[0.875rem]"
                title={`${year} in hexadecimal`}
              >
                (0x{year.toString(16).toUpperCase()})
              </span>
            </span>
          </p>
          <nav aria-label="Colophon">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="inline-flex min-h-8 items-center transition-colors duration-fast hover:text-foreground"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
              {EXTERNAL.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center transition-colors duration-fast hover:text-foreground"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
