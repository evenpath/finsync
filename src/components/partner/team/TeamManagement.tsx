
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
import { useAuth } from "../@/hooks/use-auth";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import InvitationCodesList from "./InvitationCodesList";
import InviteEmployeeByCodeDialog from "./InviteEmployeeByCodeDialog";

export default function TeamManagement() {
  const { user, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId;
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
        lastActive: doc.data().lastActive?.toDate?.() || doc.data().lastActive,
      } as TeamMember));
      
      setTeamMembers(membersData);
      
      if (!selectedMember && membersData.length > 0) {
        setSelectedMember(membersData[0]);
      } else if (selectedMember) {
        const updatedSelectedMember = membersData.find(m => m.id === selectedMember.id);
        setSelectedMember(updatedSelectedMember || null);
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error fetching team members:", error);
      let errorMessage = "Could not fetch team members.";
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check your Firestore security rules and custom claims. Your account may not have permission to view team members for this partner.";
      } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
        errorMessage = "Database index missing. Please check the Firebase console to create the required indexes for the 'teamMembers' collection.";
      }
      setFirestoreError(errorMessage);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: errorMessage,
        duration: 9000
      });
    });

    return () => unsubscribe();
  }, [partnerId, authLoading, toast, selectedMember]);

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.includes(searchTerm)
  );

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: any) => {
    if (!timeString || timeString === 'Never') return 'Never';
     try {
      return new Date(timeString).toLocaleString();
    } catch (e) {
      return 'Invalid Time';
    }
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
                                <div>
                                  <p className="font-medium">{member.name || 'Unnamed'}</p>
                                  <p className="text-sm text-muted-foreground">{member.email || member.phone}</p>
                                </div>
                              </div>
                          </div>
                        ))}
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
                      <p className="font-medium">{selectedMember.name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground capitalize">{selectedMember.role?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMember.email || 'No email'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMember.phone || 'No phone'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Joined {formatDate(selectedMember.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last active {formatTime(selectedMember.lastActive)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={selectedMember.status === 'active' ? 'default' : 'outline'}>
                        {selectedMember.status || 'unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="w-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
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
