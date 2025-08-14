
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
import { useAuth } from "../../hooks/use-auth";
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
    if (selectedUser && selectedUser.email?.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setSelectedUser(manageableUsers[0] || null);
    }
  }, [manageableUsers, selectedUser, currentUser?.email]);


  const handleInviteUser = async (newUserData: { name: string; email: string; role: 'Admin' | 'Super Admin'; }) => {
    setIsLoading(true);
    try {
        const result = await manageAdminUser(newUserData);
        
        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
            });
            setIsInviteModalOpen(false);
        } else {
            toast({
                variant: "destructive",
                title: "Error inviting admin",
                description: result.message,
            });
        }
    } catch (error) {
        console.error("Error inviting admin user:", error);
        toast({
            variant: "destructive",
            title: "Error inviting admin",
            description: (error as Error).message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Admin Users</h2>
          <p className="text-muted-foreground">Manage system administrators and their permissions.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Admin
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline">All Admins ({users.length})</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search admins..." className="pl-9" />
                        </div>
                        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                 {error ? (
                    <div className="p-6 text-center text-destructive bg-destructive/10">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <h4 className="font-bold mb-1">Failed to Load Admins</h4>
                      <p className="text-xs mb-4">{error}</p>
                      <Button asChild variant="destructive" size="sm">
                          <Link href="/admin/diagnostics">
                            <Wrench className="w-4 h-4 mr-2"/>
                            Go to Diagnostics
                          </Link>
                      </Button>
                    </div>
                ) : (
                <div className="divide-y">
                    {isLoading ? (
                      <p className="p-6 text-muted-foreground">Loading admins...</p>
                    ) : users.length === 0 ? (
                       <div className="p-6 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-bold mb-1">No Admins Found</h4>
                        <p className="text-xs mb-4">Invite the first admin to get started.</p>
                      </div>
                    ) : users.map((user) => (
                      <div
                        key={user.id}
                        className={`p-4 md:p-6 hover:bg-secondary cursor-pointer transition-colors ${
                          selectedUser?.id === user.id ? "bg-primary/10 border-l-4 border-primary" : ""
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-4">
                          <Image src={user.avatar} alt={user.name} width={48} height={48} className="rounded-full" data-ai-hint="person user" />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                           <div className="hidden md:block">
                            <Badge variant={user.role === "Super Admin" ? "danger" : "info"}>
                                {user.role}
                            </Badge>
                          </div>
                          <Badge variant={user.status === "active" ? "success" : user.status === 'invited' ? 'warning' : 'default'}>
                            {user.status}
                          </Badge>
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="font-headline">Admin Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Image src={selectedUser.avatar} alt={selectedUser.name} width={80} height={80} className="rounded-full mb-4" data-ai-hint="person user" />
                    <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <Badge variant={selectedUser.role === 'Super Admin' ? 'danger' : 'info'} className="mt-2">{selectedUser.role}</Badge>
                  </div>
                  <div className="space-y-2 pt-4">
                    <div><label className="text-sm font-medium text-muted-foreground">Status</label><p className="capitalize">{selectedUser.status}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Joined</label><p>{new Date(selectedUser.joinedDate).toLocaleDateString()}</p></div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.permissions && selectedUser.permissions.length > 0 ? selectedUser.permissions.map(p => (
                                <Badge key={p} variant="purple" className="capitalize">{p}</Badge>
                            )) : <p className="text-sm text-muted-foreground">No permissions assigned</p>}
                        </div>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full"><Settings className="w-4 h-4 mr-2" />Edit User</Button>
                    <Button variant="outline" className="w-full"><Shield className="w-4 h-4 mr-2" />Manage Permissions</Button>
                    <Button variant="destructive" className="w-full"><Trash2 className="w-4 h-4 mr-2" />Remove Admin</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a user to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <InviteAdminModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInviteUser={handleInviteUser}
      />
    </div>
  );
}
