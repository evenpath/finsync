
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import {
  UserPlus,
  Search,
  Users,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Trash2,
  MoreVertical,
  Calendar,
  Shield
} from "lucide-react";
import type { TeamMember } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";
import { useMultiWorkspaceAuth } from "../../../hooks/use-multi-workspace-auth";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import InviteEmployeeDialog from "./InviteEmployeeDialog";
import { removeTeamMemberAction } from "../../../actions/team-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export default function TeamManagement() {
  const { user, loading: authLoading, currentWorkspace } = useMultiWorkspaceAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { toast } = useToast();

  const partnerId = currentWorkspace?.partnerId;
  const userRole = currentWorkspace?.role;
  const tenantId = currentWorkspace?.tenantId;

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return teamMembers;
    return teamMembers.filter(member =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!partnerId || !db) {
      setFirestoreError("Could not identify your organization. Please ensure you are logged in correctly and have been assigned to a partner organization.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFirestoreError(null);
    
    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef,
      where("partnerId", "==", partnerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null,
        lastActive: doc.data().lastActive?.toDate ? doc.data().lastActive.toDate() : null
      } as TeamMember));
      
      setTeamMembers(membersData);
      setFirestoreError(null);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching team members:", error);
      let errorMessage = `Failed to fetch team members: ${error.message}.`;
      if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        errorMessage = "Failed to fetch team members due to missing permissions. Please check Firestore security rules.";
      }
      setFirestoreError(errorMessage);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [partnerId, authLoading]);
  
  const handleRemoveMember = async (userIdToRemove: string) => {
    if (!partnerId || !tenantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove member: missing workspace context.",
      });
      return;
    }
    
    const result = await removeTeamMemberAction({ partnerId, userIdToRemove, tenantId });
    if (result.success) {
      toast({ title: "Success", description: result.message });
      if (selectedMember?.id === userIdToRemove) {
        setSelectedMember(null);
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>;
      case 'invited': return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Invited</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'partner_admin': return <Badge variant="default">Admin</Badge>;
      case 'employee': return <Badge variant="secondary">Employee</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (firestoreError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold text-destructive">Database Connection Error</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{firestoreError}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold font-headline">
              Team Members ({teamMembers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {userRole === 'partner_admin' && (
                <Button onClick={() => setIsInviteOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border-r pr-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                 {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
                  </div>
                ) : filteredMembers.length > 0 ? filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors ${
                      selectedMember?.id === member.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{member.name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                     <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members found.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
                {selectedMember ? (
                   <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                                    {selectedMember.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getRoleBadge(selectedMember.role)}
                                        {getStatusBadge(selectedMember.status)}
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Edit Permissions</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => handleRemoveMember(selectedMember.id!)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Remove Member</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedMember.email}</div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selectedMember.phone || "Not provided"}</div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Last active: {selectedMember.lastActive ? new Date(selectedMember.lastActive).toLocaleDateString() : 'Never'}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> Joined: {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                   </div>
                ) : (
                   <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                            <Users className="h-16 w-16 mx-auto mb-4"/>
                            <h3 className="text-lg font-semibold">Select a team member</h3>
                            <p>Select a member from the list to view their details.</p>
                        </div>
                   </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <InviteEmployeeDialog 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
}
