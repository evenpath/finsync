
// src/components/partner/TeamManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
  Clock
} from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import type { TeamMember } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { inviteEmployeeAction } from "@/actions/partner-actions";
import { useMultiWorkspaceAuth } from "@/hooks/use-multi-workspace-auth";
import { usePartnerAuth } from "@/hooks/use-partner-auth";

export default function TeamManagement() {
  const { user, currentWorkspace, loading: authLoading } = useMultiWorkspaceAuth();
  const { toast } = useToast();
  
  const partnerId = currentWorkspace?.partnerId;
  const { employees, loading: partnerLoading, error: partnerError } = usePartnerAuth(partnerId);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const isLoading = authLoading || partnerLoading;

  useEffect(() => {
    if (!isLoading && employees.length > 0 && !selectedMember) {
      setSelectedMember(employees[0]);
    } else if (!isLoading && employees.length === 0) {
      setSelectedMember(null);
    }
  }, [isLoading, employees, selectedMember]);

  const handleInviteMember = async (newMemberData: { 
    name: string; 
    phone?: string; 
    email?: string;
    role: 'partner_admin' | 'employee' 
  }) => {
    if (!partnerId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not identify your organization. Please log in again.",
      });
      return;
    }

    try {
      const result = await inviteEmployeeAction({
        ...newMemberData,
        partnerId: partnerId,
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: `${newMemberData.name} has been invited to join your team.`,
        });
        setIsInviteModalOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Invitation Failed",
          description: result.message,
        });
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      throw error;
    }
  };

  const filteredMembers = employees.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!partnerId && !authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Access Error</h3>
          <p className="text-muted-foreground">Could not identify your organization. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Team Management</h2>
          <p className="text-muted-foreground">Manage your team members and their access</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline">
                  Team Members ({filteredMembers.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search members..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading team members...</p>
                  </div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Team Members</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "No members match your search." : "Start building your team by inviting members."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsInviteModalOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 md:p-6 hover:bg-secondary cursor-pointer transition-colors ${
                        selectedMember?.id === member.id ? 'bg-secondary' : ''
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Image
                              src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`}
                              alt={member.name || 'Team member'}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              member.status === 'active' ? 'bg-green-500' : 
                              member.status === 'invited' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{member.name}</h3>
                              {member.role === 'partner_admin' && (
                                <Shield className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email || member.phone}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge 
                                variant={member.role === 'partner_admin' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {member.role === 'partner_admin' ? 'Admin' : 'Employee'}
                              </Badge>
                              <Badge 
                                variant={
                                  member.status === 'active' ? 'success' : 
                                  member.status === 'invited' ? 'warning' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">
                            Last active: {formatTime(member.lastActive)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {formatDate(member.joinedDate)}
                          </p>
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
              <CardTitle className="font-headline">Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Image
                      src={selectedMember.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name || 'User')}&background=random`}
                      alt={selectedMember.name || 'Team member'}
                      width={80}
                      height={80}
                      className="rounded-full mb-4"
                    />
                    <h3 className="text-lg font-semibold text-foreground">{selectedMember.name}</h3>
                    <p className="text-muted-foreground">{selectedMember.email || selectedMember.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={selectedMember.role === 'partner_admin' ? 'default' : 'secondary'}>
                        {selectedMember.role === 'partner_admin' ? 'Admin' : 'Employee'}
                      </Badge>
                      <Badge 
                        variant={
                          selectedMember.status === 'active' ? 'success' : 
                          selectedMember.status === 'invited' ? 'warning' : 'secondary'
                        }
                      >
                        {selectedMember.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    {selectedMember.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedMember.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedMember.joinedDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Active</p>
                        <p className="text-sm text-muted-foreground">{formatTime(selectedMember.lastActive)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a team member to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteMember={handleInviteMember}
      />
    </div>
  );
}
