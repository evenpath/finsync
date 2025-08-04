
// src/components/worker/WorkspaceHeader.tsx
"use client";

import { Bell, Search, ChevronsUpDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import Image from "next/image";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';

export default function WorkspaceHeader() {
  const { user } = useAuth();
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/employee/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-card border-b px-6 py-3 flex items-center justify-between">
      <div>
        <Button variant="ghost" className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-headline text-foreground">TechCorp</h1>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4" />
          <span className="hidden md:inline ml-2">Search Tasks...</span>
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <Badge variant="danger" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">2</Badge>
        </Button>
        <Image src={user?.photoURL || "https://placehold.co/40x40.png"} alt="User" width={40} height={40} className="rounded-full" data-ai-hint="person user" />
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
