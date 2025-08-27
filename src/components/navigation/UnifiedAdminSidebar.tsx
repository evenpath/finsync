// src/components/navigation/UnifiedAdminSidebar.tsx
"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building,
  Settings,
  Users,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '../ui/sidebar';
import { Button } from "../ui/button";
import { useAuth } from '../../hooks/use-auth';
import { getAuth, signOut } from "firebase/auth";

const menuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, href: "/admin" },
  { id: "partners", label: "Partners", icon: Building, href: "/admin/partners" },
  { id: "users", label: "Admins", icon: Users, href: "/admin/users", requiredRole: 'Super Admin' },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function UnifiedAdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const auth = getAuth();
  const userRole = user?.customClaims?.role;
  const { state, setOpen } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
  };

  const isExpanded = state === 'expanded';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {isExpanded && (
            <div>
              <h1 className="font-bold text-lg">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">System Control</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <SidebarMenu>
          {menuItems.map((item) => {
            if (item.requiredRole && userRole !== item.requiredRole) {
              return null;
            }

            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <SidebarMenuItem key={item.id}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton tooltip={item.label} isActive={isActive}>
                    <IconComponent />
                    {isExpanded && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
              <LogOut />
              {isExpanded && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton onClick={() => setOpen(!isExpanded)} tooltip={isExpanded ? 'Collapse' : 'Expand'}>
              {isExpanded ? <ChevronLeft /> : <ChevronRight />}
              {isExpanded && <span>Collapse</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
