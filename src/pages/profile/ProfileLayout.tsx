import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  ];

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t dark:border-gray-800">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

