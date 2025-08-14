// src/components/partner/team/TeamManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Users,
  AlertTriangle,
  RefreshCw,
  Ticket,
  Trash2,
} from "lucide-react";
import type { TeamMember } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../hooks/use-auth";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import InvitationCodesList from "./team/InvitationCodesList";
import InviteEmployeeByCodeDialog from "./team/InviteEmployeeByCodeDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { removeTeamMemberAction } from "../../../actions/team-actions";


export default function TeamManagement() {
  const { user, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId;
  const userRole = user?.customClaims?.role;
  const isPartnerAdmin = userRole === 'partner_admin';

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
  }, [partnerId, authLoading, toast]);
  
  const handleRemoveMember = async (memberToRemove: TeamMember) => {
    if (!partnerId || !memberToRemove.userId || !memberToRemove.tenantId) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove member. Missing required information.",
      });
      return;
    }

    const result = await removeTeamMemberAction({
      partnerId: partnerId,
      userIdToRemove: memberToRemove.userId,
      tenantId: memberToRemove.tenantId
    });

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline">
            Manage Team
          </CardTitle>
          <div className="flex items-center gap-2">
            {partnerId && isPartnerAdmin && (
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
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No team members found</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by inviting your first team member.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name || 'Unnamed'}</p>
                        <p className="text-sm text-muted-foreground">{member.email || member.phone}</p>
                      </div>
                      <Badge variant={member.role === 'partner_admin' ? "destructive" : "secondary"}>
                        {member.role === 'partner_admin' ? 'Admin' : 'Employee'}
                      </Badge>
                       <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                          {member.status || 'unknown'}
                        </Badge>
                       {isPartnerAdmin && user?.uid !== member.userId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {member.name} from your team. They will lose access to this workspace. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveMember(member)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       )}
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
  );
}
