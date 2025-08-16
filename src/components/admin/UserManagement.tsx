// src/components/admin/UserManagement.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdminUser } from "../../lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../shared/Badge";
import { Input } from "../ui/input";
import {
  UserPlus,
  Filter,
  Download,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import InviteAdminModal from "./InviteAdminModal";
import { useAuth } from '../../hooks/use-auth';
import { useToast } from "../../hooks/use-toast";
import { manageAdminUser } from "../../ai/flows/manage-admin-user-flow";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";


export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
        const dbError = "Firestore is not initialized. Check Firebase configuration.";
        setError(dbError);
        setIsLoading(false);
        toast({ variant: "destructive", title: "Database Error", description: dbError });
        return;
    }
      
    setIsLoading(true);
    const q = collection(db, "adminUsers");
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const adminUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
        setUsers(adminUsers);
        setError(null);
        
        // This logic ensures a user is selected on initial load, preferring one that isn't the current user.
        if (!selectedUser && adminUsers.length > 0) {
            const defaultUser = adminUsers.find(u => u.email !== currentUser?.email);
            setSelectedUser(defaultUser || adminUsers[0]);
        }
        setIsLoading(false);
    }, (err) => {
        console.error("Error fetching admins:", err);
        let errorMessage = `Failed to fetch admins: ${err.message}.`;
        if (err.message.includes('permission-denied') || err.message.includes('insufficient permissions')) {
            errorMessage = "Failed to fetch admins due to missing permissions. Please visit the Diagnostics page to review your project's IAM role configuration.";
        }
        setError(errorMessage);
        toast({ variant: "destructive", title: "Permission Error", description: errorMessage, duration: 10000 });
        setIsLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentUser is removed to prevent re-subscribing on every render

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
        const defaultUser = users.find(u => u.email !== currentUser?.email);
        setSelectedUser(defaultUser || users[0]);
    }
  }, [users, selectedUser, currentUser?.email]);


  const manageableUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser?.customClaims?.role !== 'Super Admin' && currentUser?.email !== 'core@socket.com') return [];
    return users.filter(user => user.email.toLowerCase() !== currentUser.email?.toLowerCase());
  }, [currentUser, users]);

  useEffect(() => {
    // If the selected user is the current super admin, automatically select another user to display.
    if (selectedUser && currentUser && selectedUser.email === currentUser.email) {
        const otherUser = manageableUsers.find(u => u.email !== currentUser.email);
        setSelectedUser(otherUser || null);
    }
  }, [selectedUser, currentUser, manageableUsers]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "Super Admin" | "Admin">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "invited" | "suspended">("all");

  const filteredUsers = useMemo(() => {
    return manageableUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [manageableUsers, searchTerm, filterRole, filterStatus]);

  const handleDeleteUser = async (user: AdminUser) => {
    if (!currentUser) return;
    
    if (user.email === currentUser.email) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        const result = await manageAdminUser(user.uid || user.id, "delete");
        if (result.success) {
          toast({
            title: "User Deleted",
            description: `${user.name} has been successfully deleted.`,
          });
          // The real-time listener will automatically update the users list
        } else {
          toast({
            variant: "destructive",
            title: "Delete Failed",
            description: result.message,
          });
        }
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message || "Failed to delete user. Please try again.",
        });
      }
    }
  };

  const handleSuspendUser = async (user: AdminUser) => {
    if (!currentUser) return;

    if (user.email === currentUser.email) {
      toast({
        variant: "destructive",
        title: "Cannot Suspend",
        description: "You cannot suspend your own account.",
      });
      return;
    }

    try {
      const action = user.status === "suspended" ? "activate" : "suspend";
      const result = await manageAdminUser(user.uid || user.id, action);
      
      if (result.success) {
        toast({
          title: `User ${action === "suspend" ? "Suspended" : "Activated"}`,
          description: `${user.name} has been successfully ${action === "suspend" ? "suspended" : "activated"}.`,
        });
        // The real-time listener will automatically update the users list
      } else {
        toast({
          variant: "destructive",
          title: `${action === "suspend" ? "Suspend" : "Activate"} Failed`,
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update user status. Please try again.",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="max-w-lg w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Database Access Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error}</p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/diagnostics">
                  <Wrench className="w-4 h-4 mr-2"/>
                  View Diagnostics
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel - User list */}
      <div className="w-1/2 border-r border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Team Management</h2>
            <p className="text-muted-foreground">Manage admin users and their permissions</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Admin
          </Button>
        </div>

        {/* Search and filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {manageableUsers.length === 0 
                  ? "Invite your first admin user to get started."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.name}</p>
                    <Badge variant={user.role === "Super Admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge 
                  variant={
                    user.status === "active" ? "default" : 
                    user.status === "invited" ? "secondary" : "destructive"
                  }
                >
                  {user.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel - User details */}
      <div className="w-1/2 p-6">
        {selectedUser ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Image
                src={selectedUser.avatar}
                alt={selectedUser.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.role === "Super Admin" ? "default" : "secondary"}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-1">{selectedUser.email}</p>
                <p className="text-sm text-muted-foreground">
                  Last active: {selectedUser.lastActive}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuspendUser(selectedUser)}
                  disabled={selectedUser.email === currentUser?.email}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {selectedUser.status === "suspended" ? "Activate" : "Suspend"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  disabled={selectedUser.email === currentUser?.email}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={
                      selectedUser.status === "active" ? "default" : 
                      selectedUser.status === "invited" ? "secondary" : "destructive"
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Joined</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedUser.joinedDate}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No user selected</h3>
              <p className="text-muted-foreground">Select a user from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}