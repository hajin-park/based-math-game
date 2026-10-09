import { Link, useNavigate } from "react-router-dom";
import { BarChart3, LogOut, Settings2, SlidersHorizontal, User } from "lucide-react";

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

/** Account menu in the nav for signed-in (registered) players. */
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
          className="inline-flex size-10 items-center justify-center rounded-full"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full border bg-card font-mono text-[0.75rem] font-medium text-foreground transition-colors duration-fast hover:border-border-strong"
          >
            {initials(name)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="px-2.5 pb-2 pt-2">
          <span className="flex flex-col gap-1">
            <span className="truncate text-[0.875rem] font-semibold text-foreground">
              {name}
            </span>
            {user?.email && (
              <span className="truncate text-[0.75rem] font-normal text-muted-foreground">
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
