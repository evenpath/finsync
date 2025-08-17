"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, CheckSquare, Users, Home, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  userRole?: 'employee' | 'partner_admin' | 'admin';
}

export default function BottomNavigation({ userRole = 'employee' }: BottomNavigationProps) {
  const pathname = usePathname();

  const getNavigationItems = () => {
    switch (userRole) {
      case 'employee':
        return [
          { name: 'Home', href: '/worker', icon: Home },
          { name: 'Tasks', href: '/worker/tasks', icon: CheckSquare },
          { name: 'Chat', href: '/chat', icon: MessageSquare },
          { name: 'Profile', href: '/worker/profile', icon: Settings }
        ];
      case 'partner_admin':
        return [
          { name: 'Dashboard', href: '/partner', icon: Home },
          { name: 'Tasks', href: '/partner/tasks', icon: CheckSquare },
          { name: 'Chat', href: '/chat', icon: MessageSquare },
          { name: 'Team', href: '/partner/team', icon: Users }
        ];
      case 'admin':
        return [
          { name: 'Overview', href: '/admin', icon: Home },
          { name: 'Partners', href: '/admin/partners', icon: Users },
          { name: 'Chat', href: '/chat', icon: MessageSquare },
          { name: 'Settings', href: '/admin/settings', icon: Settings }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <nav className="flex justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
