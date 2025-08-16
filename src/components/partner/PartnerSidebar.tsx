// src/components/partner/PartnerSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ListTodo,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Zap,
  LogOut,
} from "lucide-react";
import { Badge } from "../shared/Badge";
import { useAuth } from '../../hooks/use-auth';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from '../ui/button';

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/partner" },
  { id: "workflows", label: "My Workflows", icon: Zap, href: "/partner/workflows" },
  { id: "team", label: "Team Management", icon: Users, href: "/partner/team" },
  { id: "tasks", label: "Task Overview", icon: ListTodo, href: "/partner/tasks" },
  { id: "approvals", label: "Pending Approvals", icon: CheckCircle, href: "/partner/approvals" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, href: "/partner/analytics" },
  { id: "settings", label: "Workspace Settings", icon: Settings, href: "/partner/settings" },
];

export default function PartnerSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const auth = getAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/partner/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-foreground">Socket</h1>
            <p className="text-sm text-muted-foreground">Partner Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = (item.href === '/partner' && pathname === item.href) || (item.href !== '/partner' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === "approvals" && (
                      <Badge variant="purple" className="ml-auto">
                        2
                      </Badge>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.displayName || 'Partner User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}