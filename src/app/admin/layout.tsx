// src/app/admin/layout.tsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth, AuthProvider } from '@/hooks/use-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

  return (
    <AuthProvider>
      <div className="flex h-screen bg-secondary/30 text-foreground">
        {!isAuthPage && <AdminSidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}