import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RuledSeparator } from "@/components/ui/academic";
import { useEffect } from "react";

export default function ProfileLayout() {
  const { isGuest, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect guests to signup
  useEffect(() => {
    if (isGuest) {
      navigate("/signup");
    }
  }, [isGuest, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isGuest) {
    return null;
  }

  const navItems = [
    { name: "Overview", href: "/profile", icon: User, end: true },
    { name: "Settings", href: "/profile/settings", icon: Settings },
    { name: "Game Settings", href: "/profile/game-settings", icon: Gamepad2 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r-2 border-border flex-shrink-0 flex flex-col bg-card paper-texture">
        <div className="p-6 space-y-2">
          <h2 className="text-2xl font-serif font-bold gradient-text tracking-academic">
            Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <RuledSeparator />

        <nav className="px-4 py-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm border-l-4 border-primary-foreground/50"
                    : "text-foreground hover:bg-muted/50 hover:text-primary hover:border-l-4 hover:border-primary/30 border-l-4 border-transparent"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <RuledSeparator />

        {/* Sign Out Button */}
        <div className="p-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
