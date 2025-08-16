// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building,
  Zap,
  TrendingUp,
  FileText,
  Settings,
  Shield,
  LogOut,
  Users,
  Database,
  Wrench,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from '../../hooks/use-auth';
import { getAuth, signOut } from "firebase/auth";

const menuItems = [
  { id: "overview", label: "System Overview", icon: BarChart3, href: "/admin" },
  { id: "partners", label: "Partner Management", icon: Building, href: "/admin/partners" },
  { id: "workflows", label: "Workflow Templates", icon: Zap, href: "/admin/workflows" },
  { id: "users", label: "Admin Internal", icon: Users, href: "/admin/users", requiredRole: 'Super Admin' },
  { id: "analytics", label: "System Analytics", icon: TrendingUp, href: "/admin/analytics" },
  { id: "logs", label: "System Logs", icon: FileText, href: "/admin/logs" },
  { id: "diagnostics", label: "Diagnostics & Setup", icon: Wrench, href: "/admin/diagnostics" },
  { id: "settings", label: "Admin Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const auth = getAuth();
  const userRole = user?.customClaims?.role;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Use window.location to force a full refresh, ensuring all states are cleared
      window.location.href = '/auth/login';
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
  };
  
  // Reroute "system" to "diagnostics" for backward compatibility
  const getHref = (itemHref: string) => {
      if(itemHref === '/admin/system') return '/admin/diagnostics';
      return itemHref;
  }

  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">System Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // Hide certain menu items based on user role
            if (item.requiredRole && userRole !== item.requiredRole) {
              return null;
            }

            const isActive = pathname === getHref(item.href);
            const IconComponent = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={getHref(item.href)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.displayName || 'Admin User'}
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