import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LogOut,
  Settings2,
  SlidersHorizontal,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { initials } from "@/lib/initials";

/**
 * Account menu for signed-in (registered) players: a small square name
 * plate with typewritten initials (it sits on the nav and on the cover
 * cloth), opening a slip with the name in serif and the account pages.
 */
export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const name = user?.displayName || "Player";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          className="group inline-flex size-10 items-center justify-center rounded-sm"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-[2px] border border-foreground/55 bg-card font-mono text-[0.75rem] font-bold tracking-[0.04em] text-foreground shadow-[0_1px_0_rgb(var(--shadow)/0.18)] outline outline-1 outline-offset-[-4px] outline-foreground/20 transition-colors duration-fast group-hover:border-foreground group-data-[state=open]:border-primary"
          >
            {initials(name)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="px-2.5 pb-2.5 pt-2">
          <span className="flex flex-col gap-0.5">
            <span className="smallcaps text-[0.8125rem] text-primary">
              Signed in as
            </span>
            <span className="truncate font-serif text-title-sm font-bold text-foreground">
              {name}
            </span>
            {user?.email && (
              <span className="truncate font-mono text-[0.75rem] font-normal text-muted-foreground">
                {user.email}
              </span>
            )}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/stats">
            <BarChart3 />
            Stats
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/game-settings">
            <SlidersHorizontal />
            Game settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/settings">
            <Settings2 />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
