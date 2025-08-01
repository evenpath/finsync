// src/components/admin/UserManagement.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { AdminUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Filter,
  Download,
  Search,
  Settings,
  Shield,
  Trash2,
  Users
} from "lucide-react";
import InviteAdminModal from "./InviteAdminModal";
import { useAuth } from "@/hooks/use-auth";
import { manageAdminUser } from "@/ai/flows/manage-admin-user-flow";
import { useToast } from "@/hooks/use-toast";
import { mockAdminUsers } from "@/lib/mockData";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';


export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const adminUsersCollection = collection(db, 'adminUsers');
            const adminSnapshot = await getDocs(adminUsersCollection);
            
            if (adminSnapshot.empty) {
                console.log("Admin users collection is empty, seeding with mock data...");
                for (const user of mockAdminUsers) {
                    await addDoc(collection(db, "adminUsers"), user);
                }
                const seededSnapshot = await getDocs(adminUsersCollection);
                const usersList = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
                setUsers(usersList);
            } else {
                const usersList = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
                setUsers(usersList);
            }
        } catch (error) {
            console.error("Error fetching admin users: ", error);
            toast({
                variant: "destructive",
                title: "Error fetching admin users",
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    if (currentUser?.customClaims?.role === 'Super Admin') {
        fetchAdmins();
    }
  }, [currentUser, toast]);

  const manageableUsers = useMemo(() => {
    if (!currentUser) return [];
    // Ensure we don't show the current user in the list of users they can manage
    return users.filter(user => user.email.toLowerCase() !== currentUser.email?.toLowerCase());
  }, [currentUser, users]);

  React.useEffect(() => {
    // If the selected user is the current user, deselect them
    if (selectedUser && selectedUser.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setSelectedUser(null);
    }
  }, [manageableUsers, selectedUser, currentUser]);


  const handleInviteUser = async (newUserData: { name: string; email: string; role: 'Admin' | 'Super Admin'; }) => {
    setIsLoading(true);
    try {
      // In a real app, you would first create the user in Firebase Auth.
      // For this simulation, we assume user is created separately or invited to sign up.
      // We'll call the flow to set their claims, and then add them to our adminUsers collection in Firestore.

      // Check if user already exists
      const q = query(collection(db, "adminUsers"), where("email", "==", newUserData.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("An admin with this email already exists.");
      }

      const mockUid = `mock-uid-${Math.random().toString(36).substring(7)}`;
      const result = await manageAdminUser({ uid: mockUid, role: newUserData.role });
      
      if (result.success) {
        const newUser: Omit<AdminUser, 'id'> = {
          ...newUserData,
          status: 'invited',
          lastActive: 'Never',
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: `https://placehold.co/40x40.png?text=${newUserData.name.charAt(0)}`,
          permissions: newUserData.role === 'Super Admin' ? ['all'] : ['read', 'write']
        };

        const docRef = await addDoc(collection(db, "adminUsers"), newUser);
        const createdUser = { id: docRef.id, ...newUser } as AdminUser;

        setUsers(prev => [...prev, createdUser]);
        setIsInviteModalOpen(false);

        toast({
          title: "Success",
          description: `Invitation sent to ${newUserData.email}.`,
        });

      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to invite admin user:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: (error as Error).message || "An unexpected error occurred.",
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
                    <CardTitle className="font-headline">All Admins ({manageableUsers.length})</CardTitle>
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
                <div className="divide-y">
                    {isLoading ? (
                      <p className="p-6 text-muted-foreground">Loading admins...</p>
                    ) : manageableUsers.map((user) => (
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
                    <div><label className="text-sm font-medium text-muted-foreground">Joined</label><p>{selectedUser.joinedDate}</p></div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.permissions.length > 0 ? selectedUser.permissions.map(p => (
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
