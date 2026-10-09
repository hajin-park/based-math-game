import { NavLink, Outlet } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/timeFormat";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { to: "/profile", label: "Overview", end: true },
  { to: "/profile/game-settings", label: "Game settings" },
  { to: "/profile/settings", label: "Account" },
];

/**
 * Profile shell: one h1 (the player's name), section tabs as links, and the
 * section below. Guests get the same pages (game settings are stored on the
 * device for them), with sign-up prompts where an account matters.
 */
export default function ProfileLayout() {
  const { user, isGuest, loading } = useAuth();
  const name = user?.displayName || (isGuest ? "Guest" : "Player");
  const created = user?.metadata.creationTime
    ? Date.parse(user.metadata.creationTime)
    : 0;

  return (
    <div className="container flex flex-col gap-8 py-10 md:gap-10 md:py-14">
      <header className="flex flex-col gap-6 border-b pb-0">
        <div className="flex items-center gap-4">
          {loading && !user ? (
            <>
              <Skeleton className="size-14 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-48" />
              </div>
            </>
          ) : (
            <>
              <span
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-full border bg-card font-mono text-[1.125rem] font-medium text-foreground shadow-xs"
              >
                {initials(name)}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="eyebrow">{isGuest ? "Guest profile" : "Profile"}</p>
                <h1 className="truncate font-serif text-headline font-medium [font-variation-settings:'opsz'_72]">
                  {name}
                </h1>
                <p className="truncate text-body-sm text-muted-foreground">
                  {isGuest
                    ? "Playing as a guest on this device"
                    : [
                        user?.email,
                        created ? `member since ${formatDate(created)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
              </div>
            </>
          )}
        </div>

        <nav aria-label="Profile sections" className="-mb-px overflow-x-auto">
          <ul className="flex gap-1">
            {SECTIONS.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex h-11 items-center whitespace-nowrap border-b-2 px-3 text-[0.9375rem] transition-colors duration-fast",
                      isActive
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
