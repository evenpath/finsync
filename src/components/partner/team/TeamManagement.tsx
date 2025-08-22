"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
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
  Shield,
  QrCode
} from "lucide-react";
import type { TeamMember } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../hooks/use-auth";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { removeTeamMemberAction } from "../../../actions/team-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import GenerateInviteCodeDialog from "./GenerateInviteCodeDialog";
import InvitationManagement from "./InvitationManagement";
import TaskAssignmentModal from "../../chat/TaskAssignmentModal"; // Import the modal

export default function TeamManagement() {
  const { user, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [inviteRefreshTrigger, setInviteRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Get partner info from user's custom claims
  const partnerId = user?.customClaims?.partnerId;
  const tenantId = user?.customClaims?.tenantId;
  const userRole = user?.customClaims?.role;

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
      setFirestoreError(
        `Could not identify your organization. Please ensure you are logged in correctly.
        
        Debug info:
        - Partner ID: ${partnerId || 'missing'}
        - User: ${user?.email || 'not found'}
        - Role: ${user?.customClaims?.role || 'none'}`
      );
      setIsLoading(false);
      return;
    }

    console.log('Fetching team members for partner:', partnerId);
    setIsLoading(true);
    setFirestoreError(null);
    
    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef,
      where("partnerId", "==", partnerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Found ${snapshot.docs.length} team members`);
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
      setFirestoreError(`Access denied to team members: ${error.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [partnerId, authLoading, user]);
  
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

  const handleInviteGenerated = () => {
    setInviteRefreshTrigger(prev => prev + 1);
  };
  
  const handleTaskAssigned = (taskData: any) => {
    toast({
        title: "Task Assigned",
        description: `Task "${taskData.title}" has been assigned to ${taskData.assignee}.`
    });
    setIsTaskModalOpen(false);
  }

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
            <pre className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto text-left bg-muted p-4 rounded whitespace-pre-wrap">
              {firestoreError}
            </pre>
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
      <Tabs defaultValue="members" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Invitations
            </TabsTrigger>
          </TabsList>
          
          {userRole === 'partner_admin' && (
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Generate Invite Code
            </Button>
          )}
        </div>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-headline">
                Active Team Members ({teamMembers.length})
              </CardTitle>
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
                        <span className="text-sm text-muted-foreground">Loading team members...</span>
                      </div>
                    ) : filteredMembers.length > 0 ? filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors ${
                          selectedMember?.id === member.id ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'
                        }`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{member.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {getRoleBadge(member.role)}
                              {getStatusBadge(member.status)}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No team members found</p>
                        {userRole === 'partner_admin' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setIsInviteDialogOpen(true)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Generate First Invite
                          </Button>
                        )}
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
                                {userRole === 'partner_admin' && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setIsTaskModalOpen(true)}>
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                        <span>Assign Task</span>
                                      </DropdownMenuItem>
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
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" /> 
                                  {selectedMember.email || 'No email provided'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" /> 
                                  {selectedMember.phone || "Not provided"}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" /> 
                                  Last active: {selectedMember.lastActive ? 
                                    new Date(selectedMember.lastActive).toLocaleDateString() : 'Never'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" /> 
                                  Joined: {selectedMember.joinedDate ? 
                                    new Date(selectedMember.joinedDate).toLocaleDateString() : 'Unknown'}
                                </div>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Performance</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Tasks Completed: <span className="font-bold">{selectedMember.tasksCompleted || 0}</span></div>
                                    <div>Avg. Completion Time: <span className="font-bold">{selectedMember.avgCompletionTime || 'N/A'}</span></div>
                                </div>
                            </div>
                        </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold mb-2">Select a Team Member</h3>
                            <p>Choose a member from the list to view their details and manage their access.</p>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManagement 
            partnerId={partnerId!} 
            refreshTrigger={inviteRefreshTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GenerateInviteCodeDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        partnerId={partnerId!}
        onInviteGenerated={handleInviteGenerated}
      />
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskAssigned={handleTaskAssigned}
        activeWorkspace={user?.customClaims}
        teamMembers={teamMembers}
      />
    </>
  );
}
