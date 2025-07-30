"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building,
  Zap,
  TrendingUp,
  FileText,
  Settings,
  Shield,
} from "lucide-react";

const menuItems = [
  { id: "overview", label: "System Overview", icon: BarChart3, href: "/admin" },
  { id: "partners", label: "Partner Management", icon: Building, href: "/admin/partners" },
  { id: "workflows", label: "Workflow Templates", icon: Zap, href: "/admin/workflows" },
  { id: "analytics", label: "System Analytics", icon: TrendingUp, href: "/admin/analytics" },
  { id: "logs", label: "System Logs", icon: FileText, href: "/admin/logs" },
  { id: "settings", label: "Admin Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isHomeActive = pathname === '/admin';
  
  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-foreground">Flow Factory</h1>
            <p className="text-sm text-muted-foreground">Admin Control</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.id === 'overview' ? isHomeActive : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Super Admin
            </p>
            <p className="text-xs text-muted-foreground">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
