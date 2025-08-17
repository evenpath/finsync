// src/components/partner/team/TeamManagement.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../shared/Badge";
import { Input } from "../../ui/input";
import {
  UserPlus,
  Filter,
  Download,
  Search,
  Send,
  MessageSquare,
  Settings,
  XCircle,
  Users,
  Phone,
  Mail,
  Calendar,
  Shield,
  Clock,
  AlertTriangle,
  RefreshCw,
  Ticket,
} from "lucide-react";
import type { TeamMember } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../hooks/use-auth";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import InviteEmployeeByCodeDialog from "./InviteEmployeeByCodeDialog";
import InvitationCodesList from "./InvitationCodesList";
import { useMultiWorkspaceAuth } from "../../../hooks/use-multi-workspace-auth";
import { removeTeamMemberAction } from "../../../actions/team-actions";

export default function TeamManagement() {
  const { user, loading: authLoading, canModifyPartner } = useMultiWorkspaceAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.activePartnerId;
  const tenantId = user?.customClaims?.activeTenantId;
  const canManageTeam = canModifyPartner(partnerId || '');

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
        joinedDate: doc.data().joinedDate?.toDate ? doc.data().joinedDate.toDate().toISOString() : doc.data().joinedDate,
        lastActive: doc.data().lastActive?.toDate ? doc.data().lastActive.toDate().toISOString() : doc.data().lastActive
      } as TeamMember));
      
      setTeamMembers(membersData);
      if (!selectedMember && membersData.length > 0) {
        setSelectedMember(membersData[0]);
      }
      setFirestoreError(null);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching team members:", error);
      let errorMessage = `Failed to fetch team members: ${error.message}`;
      if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        errorMessage = "Failed to fetch team members due to missing permissions. Please check Firestore security rules.";
      }
      setFirestoreError(errorMessage);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [partnerId, authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'invited': return <Badge variant="warning">Invited</Badge>;
      case 'suspended': return <Badge variant="danger">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'partner_admin': return <Badge variant="default">Admin</Badge>;
      case 'employee': return <Badge variant="info">Employee</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };
  
  const handleRemoveMember = async (memberToRemove: TeamMember) => {
    if (!partnerId || !tenantId) return;

    const result = await removeTeamMemberAction({
        partnerId,
        tenantId,
        userIdToRemove: memberToRemove.id,
    });

    if (result.success) {
        toast({ title: "Success", description: result.message });
        setSelectedMember(null);
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  if (firestoreError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Database Connection Error</h3>
          <p className="text-muted-foreground mb-4 max-w-md">{firestoreError}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Link href="/partner/team/diagnostics">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Diagnostics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2">
        <Card className="h-full">
            <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold font-headline">
                Manage Team
                </CardTitle>
                <div className="flex items-center gap-2">
                {partnerId && canManageTeam && (
                    <InviteEmployeeByCodeDialog 
                        partnerId={partnerId} 
                        onSuccess={() => {
                            // Optionally refresh or show a tab
                        }} 
                    />
                )}
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="members">
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">
                    <Users className="w-4 h-4 mr-2" />
                    Team Members ({teamMembers.length})
                </TabsTrigger>
                <TabsTrigger value="invitations">
                    <Ticket className="w-4 h-4 mr-2" />
                    Invitations
                </TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="mt-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">Loading team members...</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                            placeholder="Search members by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                            />
                        </div>
                        <div className="divide-y max-h-[60vh] overflow-y-auto">
                            {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedMember?.id === member.id ? 'bg-muted/50' : ''
                                }`}
                                onClick={() => setSelectedMember(member)}
                            >
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {member.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                    <h4 className="font-medium text-foreground">{member.name || 'Unknown User'}</h4>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getRoleBadge(member.role)}
                                    {getStatusBadge(member.status)}
                                </div>
                                </div>
                            </div>
                            )) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">No team members found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Invite your first team member to get started.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </TabsContent>
                <TabsContent value="invitations" className="mt-4">
                    {partnerId && <InvitationCodesList partnerId={partnerId} />}
                </TabsContent>
            </Tabs>
            </CardContent>
        </Card>
      </div>

      <div className="h-full">
        {selectedMember ? (
            <Card className="sticky top-6">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Member Details
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-foreground">{selectedMember.name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-foreground">{selectedMember.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <div className="mt-1">{getRoleBadge(selectedMember.role)}</div>
                    </div>
                    </div>
                    <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedMember.status)}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Joined</label>
                        <p className="text-foreground">
                        {selectedMember.joinedDate ? new Date(selectedMember.joinedDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Active</label>
                        <p className="text-foreground">
                        {selectedMember.lastActive ? new Date(selectedMember.lastActive).toLocaleDateString() : 'Never'}
                        </p>
                    </div>
                    </div>
                </div>
                {canManageTeam && user?.uid !== selectedMember.id && (
                    <div className="flex gap-2 mt-6 border-t pt-4">
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Permissions
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(selectedMember)}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove from Team
                        </Button>
                    </div>
                )}
                </CardContent>
            </Card>
        ) : (
             <Card className="flex items-center justify-center h-full text-center">
                 <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Select a member</h3>
                    <p className="text-muted-foreground">
                        Choose a team member to view their details and manage their permissions.
                    </p>
                 </CardContent>
             </Card>
        )}
      </div>
    </div>
  );
}
