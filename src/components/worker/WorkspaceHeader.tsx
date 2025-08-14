// src/components/worker/WorkspaceHeader.tsx
"use client";

import React from 'react';
import { User, Phone, Mail, LogOut, ListTodo } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/use-auth';
import { Skeleton } from '../ui/skeleton';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';
import { useToast } from '../../hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function WorkspaceHeader() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Unable to sign out. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Workspace info */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              My Tasks
            </h1>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {user.displayName?.charAt(0)?.toUpperCase() || 
                     user.phoneNumber?.slice(-2) || 
                     user.email?.charAt(0)?.toUpperCase() || 
                     '?'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium">
                      {user.displayName || 'User'}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                
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
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
