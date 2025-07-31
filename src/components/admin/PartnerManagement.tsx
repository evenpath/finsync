// src/components/admin/PartnerManagement.tsx
"use client";

import React, { useState } from "react";
import { mockPartners } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Filter,
  Download,
  Building,
  Edit3,
  Send,
  Eye,
  Settings,
  Search
} from "lucide-react";
import AddPartnerModal from "./AddPartnerModal"; // Make sure this path is correct

export default function PartnerManagement() {
  const [partners, setPartners] = useState(mockPartners);
  const [selectedPartner, setSelectedPartner] = useState(partners[0]);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);

  const handleAddPartner = (newPartnerData: Omit<typeof mockPartners[0], 'id' | 'status' | 'joinedDate' | 'lastActive'>) => {
    const newPartner = {
      ...newPartnerData,
      id: partners.length + 1,
      status: 'pending' as const,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    };
    console.log("Adding new partner:", newPartner);
    // In a real app, you'd send this to your backend.
    // For now, we'll just add it to our local state.
    setPartners(prev => [...prev, newPartner]);
    setIsAddPartnerModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Partner Organizations</h2>
          <p className="text-muted-foreground">Manage partner accounts and permissions</p>
        </div>
        <Button onClick={() => setIsAddPartnerModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline">All Partners</CardTitle>
                     <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search partners..." className="pl-9" />
                        </div>
                        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`p-6 hover:bg-secondary cursor-pointer transition-colors ${
                      selectedPartner?.id === partner.id
                        ? "bg-primary/10 border-l-4 border-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                        </div>
                      </div>
                      <Badge variant={
                        partner.status === 'active' ? 'success' :
                        partner.status === 'pending' ? 'warning' : 'default'
                      }>
                        {partner.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">{partner.members}</span>
                        <p className="text-xs">Members</p>
                      </div>
                      <div>
                        <span className="font-medium">{partner.workflows}</span>
                        <p className="text-xs">Workflows</p>
                      </div>
                      <div>
                        <span className="font-medium">{partner.tasksCompleted}</span>
                        <p className="text-xs">Tasks</p>
                      </div>
                      <div>
                        <span className="font-medium">{partner.plan}</span>
                        <p className="text-xs">Plan</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6 p-6">
            {selectedPartner ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Partner Details</h3>
                  <Button variant="ghost" size="icon">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization</label>
                        <p className="text-foreground font-semibold">{selectedPartner.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                        <p className="text-foreground">{selectedPartner.email}</p>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div><Badge variant={selectedPartner.status === 'active' ? 'success' : 'warning'}>{selectedPartner.status}</Badge></div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                        <p className="text-foreground">{selectedPartner.joinedDate}</p>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Active</label>
                        <p className="text-foreground">{selectedPartner.lastActive}</p>
                    </div>
                    <div className="pt-4 space-y-2">
                        <Button className="w-full"><Send className="w-4 h-4 mr-2" />Assign Workflows</Button>
                        <Button variant="outline" className="w-full"><Eye className="w-4 h-4 mr-2" />View Analytics</Button>
                        <Button variant="outline" className="w-full"><Settings className="w-4 h-4 mr-2" />Manage Settings</Button>
                    </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <Building className="w-12 h-12 mx-auto mb-4" />
                <p>Select a partner to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
       <AddPartnerModal 
        isOpen={isAddPartnerModalOpen} 
        onClose={() => setIsAddPartnerModalOpen(false)}
        onAddPartner={handleAddPartner}
      />
    </div>
  );
}
