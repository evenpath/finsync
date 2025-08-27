// src/app/admin/users/page.tsx
"use client";

import AdminHeader from "../../../components/admin/AdminHeader";
import UserManagement from "../../../components/admin/UserManagement";
import { useAuth } from '../../../hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  const { user } = useAuth();

  // A user is a Super Admin if their role is set OR if they use the primary admin email.
  const isAuthorized = user?.customClaims?.role === 'Super Admin' || user?.email === 'core@suupe.com';

  if (!isAuthorized) {
    return (
      <>
        <AdminHeader
          title="Permission Denied"
          subtitle="You do not have access to this page."
        />
        <main className="flex-1 overflow-auto p-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert />
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Only users with the 'Super Admin' role can manage other administrators.
                Please contact your system administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Admin Internal"
        subtitle="Manage internal admin users, roles, and permissions."
      />
      <main className="flex-1 overflow-auto p-6">
        <UserManagement />
      </main>
    </>
  );
}
