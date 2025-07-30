"use client";

import React, { useState } from "react";
import { mockTeamMembers } from "@/lib/mockData";
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
  Users
} from "lucide-react";

export default function TeamManagement() {
  const [selectedMember, setSelectedMember] = useState(mockTeamMembers[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Team Management</h2>
          <p className="text-muted-foreground">Manage your team members and their access</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline">Team Members</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search members..." className="pl-9" />
                        </div>
                        <Button variant="outline" size="sm"><Filter className="w-4 h-4" /> Filter</Button>
                        <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Export</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {mockTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-4 md:p-6 hover:bg-secondary cursor-pointer transition-colors ${
                          selectedMember?.id === member.id ? "bg-primary/10 border-l-4 border-primary" : ""
                        }`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="flex items-center gap-4">
                          <Image src={member.avatar} alt={member.name} width={48} height={48} className="rounded-full" data-ai-hint="person user" />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge variant={member.status === "active" ? "success" : "warning"}>
                            {member.status}
                          </Badge>
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{member.tasksCompleted} tasks</p>
                            <p className="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
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
              <CardTitle className="font-headline">Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Image src={selectedMember.avatar} alt={selectedMember.name} width={80} height={80} className="rounded-full mb-4" data-ai-hint="person user" />
                    <h3 className="text-lg font-semibold text-foreground">{selectedMember.name}</h3>
                    <p className="text-muted-foreground">{selectedMember.role}</p>
                    <Badge variant={selectedMember.status === 'active' ? 'success' : 'warning'} className="mt-2">{selectedMember.status}</Badge>
                  </div>
                  <div className="space-y-2 pt-4">
                    <div><label className="text-sm font-medium text-muted-foreground">Email</label><p>{selectedMember.email}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Joined</label><p>{selectedMember.joinedDate}</p></div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Skills</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedMember.skills.length > 0 ? selectedMember.skills.map(skill => (
                                <Badge key={skill} variant="purple">{skill}</Badge>
                            )) : <p className="text-sm text-muted-foreground">No skills assigned</p>}
                        </div>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full"><Send className="w-4 h-4" />Assign Workflows</Button>
                    <Button variant="outline" className="w-full"><MessageSquare className="w-4 h-4" />Send Message</Button>
                    <Button variant="outline" className="w-full"><Settings className="w-4 h-4" />Manage Permissions</Button>
                    {selectedMember.status === 'active' && (
                        <Button variant="danger" className="w-full"><XCircle className="w-4 h-4" />Suspend Member</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a team member to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
