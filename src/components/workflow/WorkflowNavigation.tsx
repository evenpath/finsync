// src/components/workflow/WorkflowNavigation.tsx
// This adds workflow navigation without modifying existing layouts

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutGrid, 
  FileText, 
  BarChart3, 
  Users, 
  CheckSquare,
  Settings,
  Zap
} from 'lucide-react';
import { useWorkflowAuth } from '@/hooks/use-workflow-auth';

interface WorkflowNavigationProps {
  className?: string;
}

export default function WorkflowNavigation({ className }: WorkflowNavigationProps) {
  const pathname = usePathname();
  const { 
    canCreateGlobalTemplates, 
    canCustomizeTemplates, 
    canExecuteTasks,
    user 
  } = useWorkflowAuth();

  // Determine navigation items based on permissions
  const getNavItems = () => {
    if (canCreateGlobalTemplates) {
      // Super Admin navigation
      return [
        { href: '/admin/workflows', label: 'Templates', icon: FileText },
        { href: '/admin/workflows/builder', label: 'Builder', icon: LayoutGrid },
        { href: '/admin/workflows/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/workflows/assignments', label: 'Assignments', icon: Users },
      ];
    }
    
    if (canCustomizeTemplates) {
      // Partner Admin navigation
      return [
        { href: '/partner/(protected)/workflows', label: 'Available Templates', icon: FileText },
        { href: '/partner/(protected)/workflows/instances', label: 'My Workflows', icon: Settings },
        { href: '/partner/(protected)/workflows/tasks', label: 'Team Tasks', icon: CheckSquare },
      ];
    }
    
    if (canExecuteTasks) {
      // Employee navigation
      return [
        { href: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
        { href: '/employee/tasks/history', label: 'Task History', icon: BarChart3 },
      ];
    }

    return [];
  };

  const navItems = getNavItems();
  
  if (navItems.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 mr-2">
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Workflows</span>
      </div>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href={item.href} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
      
      {canCreateGlobalTemplates && (
        <Badge variant="outline" className="text-xs ml-2">
          Global Admin
        </Badge>
      )}
    </div>
  );
}