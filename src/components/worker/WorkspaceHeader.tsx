// src/components/worker/WorkspaceHeader.tsx
"use client";

import React from 'react';
import { Bell, Search, Settings, HelpCircle, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkspaceHeader() {
  const { user, loading } = useAuth();

  const currentWorkspace = user?.customClaims ? {
    partnerId: user.customClaims.activePartnerId || user.customClaims.partnerId,
    partnerName: user.customClaims.partnerName || user.displayName || 'Current Workspace',
    role: user.customClaims.role
  } : null;

  if (loading) {
    return (
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </header>
    );
  }

  if (!user || !currentWorkspace) {
    return (
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-400">
            No Workspace Selected
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Workspace info and search */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentWorkspace.partnerName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={currentWorkspace.role === 'partner_admin' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentWorkspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
              </Badge>
              <span className="text-sm text-gray-500">
                ID: {currentWorkspace.partnerId}
              </span>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search workflows, tasks..." 
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {user.displayName?.charAt(0)?.toUpperCase() || 
                   user.phoneNumber?.slice(-2) || 
                   user.email?.charAt(0)?.toUpperCase() || 
                   '?'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.phoneNumber || user.email || 'No contact info'}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <div className="font-medium">{user.displayName || 'User'}</div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="h-3 w-3" />
                    {user.phoneNumber}
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}