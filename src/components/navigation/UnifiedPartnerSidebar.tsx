// src/components/navigation/UnifiedPartnerSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '../ui/sidebar';
import { useAuth } from '../../hooks/use-auth';

const navigation = [
  {
    name: 'Dashboard',
    href: '/partner',
    icon: LayoutDashboard,
  },
  {
    name: 'Team',
    href: '/partner/team',
    icon: Users,
  },
  {
    name: 'Tasks',
    href: '/partner/tasks',
    icon: CheckSquare,
  },
];

export default function UnifiedPartnerSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { state, setOpen } = useSidebar();
  const isExpanded = state === 'expanded';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-1">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          {isExpanded && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Partner</h1>
              <p className="text-sm text-gray-500">Workspace</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton tooltip={item.name} isActive={isActive}>
                    <Icon />
                    {isExpanded && <span>{item.name}</span>}
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
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              {isExpanded && <span>Settings</span>}
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
