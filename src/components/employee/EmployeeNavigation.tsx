import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  CheckSquare, 
  MessageCircle, 
  Bell, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/employee',
    icon: Home
  },
  {
    name: 'My Tasks',
    href: '/employee/tasks',
    icon: CheckSquare
  },
  {
    name: 'Team Chat',
    href: '/employee/chat',
    icon: MessageCircle
  },
  {
    name: 'Notifications',
    href: '/employee/notifications',
    icon: Bell
  },
  {
    name: 'Profile',
    href: '/employee/profile',
    icon: User
  },
  {
    name: 'Settings',
    href: '/employee/settings',
    icon: Settings
  }
];

export function EmployeeNavigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">Employee Portal</h2>
        {user && (
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {user.displayName || user.email}
          </p>
        )}
      </div>
      
      <div className="flex-1 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/employee' && pathname?.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}