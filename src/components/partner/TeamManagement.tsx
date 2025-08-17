// src/components/partner/TeamManagement.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
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
import type { TeamMember } from "../../lib/types";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from '../../hooks/use-auth';
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import InvitationCodesList from "./team/InvitationCodesList";
import InviteEmployeeByCodeDialog from "./team/InviteEmployeeByCodeDialog";
import { removeTeamMemberAction } from "@/actions/team-actions";

export default function TeamManagement() {
  const { user, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId;
  const tenantId = user?.customClaims?.tenantId;
  const userRole = user?.customClaims?.role;

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
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        lastActive: doc.data().lastActive?.toDate?.() || doc.data().lastActive
      } as TeamMember));
      
      setTeamMembers(membersData);
      setFirestoreError(null);
      
      if (!selectedMember && membersData.length > 0) {
        setSelectedMember(membersData[0]);
      } else if(selectedMember){
        const updatedSelected = membersData.find(m => m.id === selectedMember.id);
        setSelectedMember(updatedSelected || null);
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching team members:", error);
      let errorMessage = `Failed to fetch team members: ${error.message}`;
      if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        errorMessage = "Failed to fetch team members due to missing permissions. Please visit the Diagnostics page to review your project's IAM role configuration.";
      }
      setFirestoreError(errorMessage);
      toast({ variant: "destructive", title: "Permission Error", description: errorMessage, duration: 10000 });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading, partnerId, toast]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.phone?.includes(searchTerm);
      return matchesSearch;
    });
  }, [teamMembers, searchTerm]);

  const handleRemoveMember = async (userId: string, tenantId: string) => {
    if (!partnerId) {
      toast({ variant: "destructive", title: "Error", description: "Partner ID not found." });
      return;
    }
    const result = await removeTeamMemberAction({ partnerId, userIdToRemove: userId, tenantId });
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setSelectedMember(null); // Deselect the removed member
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (firestoreError) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="max-w-lg w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {firestoreError}
            </p>
            <Button asChild variant="outline">
              <Link href="/partner/team/diagnostics">
                <Settings className="w-4 h-4 mr-2"/>
                View Access Diagnostics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline">
                  Manage Team
                </CardTitle>
                <div className="flex items-center gap-2">
                  {partnerId && userRole === 'partner_admin' && (
                    <InviteEmployeeByCodeDialog partnerId={partnerId} />
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
                <TabsContent value="members">
                  <div className="border-t mt-4 pt-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">Loading team members...</span>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No team members found</h3>
                        <p className="text-muted-foreground mb-4">
                          Get started by inviting your first team member.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <div className="divide-y">
                          {filteredMembers.map((member) => (
                            <div
                              key={member.id}
                              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedMember?.id === member.id ? 'bg-muted' : ''
                              }`}
                              onClick={() => setSelectedMember(member)}
                            >
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {member.name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{member.name || 'Unnamed'}</p>
                                    <p className="text-sm text-muted-foreground">{member.email || member.phone}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                                      {member.status || 'unknown'}
                                    </Badge>
                                  </div>
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="invitations">
                  <div className="border-t mt-4 pt-4">
                    {partnerId && <InvitationCodesList partnerId={partnerId} />}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Member Details Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {selectedMember.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedMember.name || 'Unnamed'}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{(selectedMember.role || '').replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedMember.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedMember.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {formatDate(selectedMember.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Last active {selectedMember.lastActive ? new Date(selectedMember.lastActive).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Badge variant={selectedMember.status === 'active' ? 'default' : 'outline'}>
                        {selectedMember.status || 'unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    {userRole === 'partner_admin' && selectedMember.id !== user?.uid && (
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => handleRemoveMember(selectedMember.id, selectedMember.tenantId as string)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Remove from Team
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a team member to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
