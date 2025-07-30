"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Settings,
  Target,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Badge } from "@/components/shared/Badge";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/partner" },
  { id: "workflows", label: "My Workflows", icon: WorkflowIcon, href: "/partner/workflows" },
  { id: "team", label: "Team Management", icon: Users, href: "/partner/team" },
  { id: "tasks", label: "Task Overview", icon: Target, href: "/partner/tasks" },
  { id: "approvals", label: "Pending Approvals", icon: CheckCircle, href: "/partner/approvals" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, href: "/partner/analytics" },
  { id: "settings", label: "Workspace Settings", icon: Settings, href: "/partner/settings" },
];

export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-foreground">TechCorp</h1>
            <p className="text-sm text-muted-foreground">Partner Admin</p>
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
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === "approvals" && (
                      <Badge variant="danger" className="ml-auto">3</Badge>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
            PA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Partner Admin</p>
            <p className="text-xs text-muted-foreground">admin@techcorp.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
