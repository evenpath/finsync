// src/app/(employee-auth)/layout.tsx
"use client";

import { useAuth, AuthProvider } from '@/hooks/use-auth.tsx';
export default function EmployeeAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        {children}
      </div>
    </AuthProvider>
  );
}
