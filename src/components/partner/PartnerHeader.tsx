// src/components/partner/PartnerHeader.tsx
"use client";

import React from 'react';
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../shared/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from '../../hooks/use-auth';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

type PartnerHeaderProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export default function PartnerHeader({ title, subtitle, actions }: PartnerHeaderProps) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      router.push('/partner/login');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "An unexpected error occurred while signing out."
      });
    }
  };

  const UserMenu = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      );
    }
    
    if (!user) return null;

    const userInitial = user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {userInitial}
            </div>
            <span className="hidden sm:inline">{user.displayName || user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 hidden sm:flex">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="relative h-9 w-9">
            <Bell className="w-4 h-4" />
            <Badge variant="danger" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">5</Badge>
          </Button>
          {actions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
