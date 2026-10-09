import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAvatarUrl } from "@/lib/avatarGenerator";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserPhotoURL = () => {
    if (!user) return undefined;

    // Get photoURL or generate pixel art avatar
    const photoURL = user && "photoURL" in user ? user.photoURL : null;
    return getUserAvatarUrl({ photoURL }, user.uid);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="inline-flex size-10 items-center justify-center rounded-full transition-opacity duration-fast hover:opacity-85"
        >
          <Avatar className="size-8 cursor-pointer">
            <AvatarImage
              src={getUserPhotoURL()}
              alt={user?.displayName || "User"}
            />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="px-2.5 pb-2 pt-2">
          <div className="flex flex-col gap-1">
            <p className="truncate text-[0.875rem] font-semibold text-foreground">
              {user?.displayName || "User"}
            </p>
            {user && "email" in user && user.email && (
              <p className="truncate text-[0.75rem] font-normal text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer"
        >
          <User />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/profile/settings")}
          className="cursor-pointer"
        >
          <Settings />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
