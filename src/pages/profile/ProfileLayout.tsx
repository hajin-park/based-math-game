import { NavLink, Outlet } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/timeFormat";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { to: "/profile", label: "Overview", end: true },
  { to: "/profile/settings", label: "Account" },
  { to: "/profile/game-settings", label: "Game settings" },
];

/**
 * Profile shell: the bookplate pasted inside the cover ("This book belongs
 * to", the player's name as the page's one h1, member since), then the three
 * sections as a running-head tab line, then the section. Guests get the same
 * pages (game settings are stored on the device for them), with sign-up
 * prompts where an account matters.
 */
export default function ProfileLayout() {
  const { user, isGuest, loading } = useAuth();
  const name = user?.displayName || (isGuest ? "Guest" : "Player");
  const created = user?.metadata.creationTime
    ? Date.parse(user.metadata.creationTime)
    : 0;

  return (
    <div className="container flex flex-col gap-8 py-8 md:gap-10 md:py-12">
      <header className="flex flex-col gap-8 md:gap-10">
        <div className="paper-sheet w-full max-w-[34rem] self-center rounded-[3px] p-1.5 sm:p-2">
          <div className="flex flex-col items-center gap-2 border-[1.5px] border-foreground/70 px-5 py-6 text-center outline outline-1 outline-offset-[3px] outline-foreground/30 sm:px-10 sm:py-7">
            <p className="smallcaps text-[0.9375rem] tracking-[0.12em] text-primary">
              This book belongs to
            </p>
            {loading && !user ? (
              <>
                <Skeleton className="my-1.5 h-9 w-56 rounded-sm" />
                <Skeleton className="h-3.5 w-40 rounded-sm" />
              </>
            ) : (
              <>
                <h1 className="max-w-full break-words text-display-lg font-bold">
                  {isGuest && !user?.displayName ? (
                    <span className="italic">Guest</span>
                  ) : (
                    name
                  )}
                </h1>
                <p className="font-sans text-[0.875rem] text-muted-foreground">
                  {isGuest ? (
                    "Playing as a guest on this device"
                  ) : created ? (
                    <>
                      Member since{" "}
                      <span className="font-mono text-foreground">
                        {formatDate(created)}
                      </span>
                    </>
                  ) : null}
                </p>
              </>
            )}
          </div>
        </div>

        <nav
          aria-label="Profile sections"
          className="overflow-x-auto border-y border-foreground/25"
        >
          <ul className="flex justify-start gap-1 sm:justify-center sm:gap-6">
            {SECTIONS.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.end}
                  className={({ isActive }) =>
                    cn(
                      "smallcaps -mb-px inline-flex h-11 items-center whitespace-nowrap border-b-2 px-2.5 text-[1rem] tracking-[0.06em] transition-colors duration-fast xs:px-3",
                      isActive
                        ? "border-primary text-primary"
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
