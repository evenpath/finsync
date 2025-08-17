"use client";

import { AuthProvider } from "../../hooks/use-auth";

// This is now the root layout for *all* /partner routes.
// It only contains the AuthProvider. The visual layout and auth protection
// are handled by nested layouts.
export default function PartnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
