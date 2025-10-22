import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Gamepad2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

export default function ProfileLayout() {
  const { isGuest, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect guests to signup
  useEffect(() => {
    if (isGuest) {
      navigate('/signup');
    }
  }, [isGuest, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isGuest) {
    return null;
  }

  const navItems = [
    { name: 'Overview', href: '/profile', icon: User, end: true },
    { name: 'Settings', href: '/profile/settings', icon: Settings },
    { name: 'Game Settings', href: '/profile/game-settings', icon: Gamepad2 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border flex-shrink-0 flex flex-col bg-card">
        <div className="p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold gradient-text">Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>

        <Separator />

        <nav className="px-4 py-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* Sign Out Button */}
        <div className="p-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

