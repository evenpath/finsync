
import AdminHeader from "@/components/admin/AdminHeader";
import UserManagement from "@/components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <>
      <AdminHeader
        title="User Management"
        subtitle="Manage admin users, roles, and permissions."
      />
      <main className="flex-1 overflow-auto p-6">
        <UserManagement />
      </main>
    </>
  );
}
