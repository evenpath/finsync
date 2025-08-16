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
                  <span className="text-sm font-medium">
                    {user.displayName || user.phoneNumber || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || user.phoneNumber}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListTodo className="mr-2 h-4 w-4" />
                  <span>My Tasks</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}