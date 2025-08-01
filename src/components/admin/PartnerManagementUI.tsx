
"use client";

import React, { useState, useEffect } from 'react';
import type { Partner } from '@/lib/types';
import PartnerCard from "@/components/admin/PartnerCard";
import PartnerDetailView from "@/components/admin/PartnerDetailView";
import { UserPlus, Search, ListFilter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPartnerModal from "@/components/admin/AddPartnerModal";
import { Card, CardContent } from '@/components/ui/card';
import { createTenant } from '@/ai/flows/create-tenant-flow';

interface PartnerManagementUIProps {
    initialPartners: Partner[];
    error?: string | null;
}

export default function PartnerManagementUI({ initialPartners, error = null }: PartnerManagementUIProps) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Set the first partner as selected by default when the component loads
    useEffect(() => {
        if (initialPartners.length > 0 && !selectedPartner) {
            setSelectedPartner(initialPartners[0]);
        }
    }, [initialPartners, selectedPartner]);


    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                 <Card className="w-full max-w-md border-destructive">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                            <div>
                                <h3 className="text-lg font-bold text-destructive">Error Fetching Data</h3>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // In a real app, this would be wired up to a backend.
    const handleAddPartner = async (newPartnerData: any) => {
        console.log("Adding new partner:", newPartnerData.name);
        try {
            // This is a server action and is safe to call from a client component.
            const result = await createTenant({ partnerName: newPartnerData.name });

            if (result.success) {
                console.log("Tenant created successfully:", result.tenantId);
                // Here, you would typically write the new partner to Firestore using the tenantId.
                // For now, we'll just optimistically update the UI with mock data.
                 const newPartner: Partner = {
                    id: result.tenantId || `partner-${Date.now()}`,
                    name: newPartnerData.name,
                    businessName: newPartnerData.name,
                    contactPerson: newPartnerData.name,
                    email: newPartnerData.email,
                    phone: '',
                    status: 'active',
                    plan: newPartnerData.plan,
                    joinedDate: new Date().toISOString(),
                    industry: null,
                    businessSize: 'small',
                    employeeCount: 0,
                    monthlyRevenue: '0',
                    location: { city: '', state: '' },
                    aiProfileCompleteness: 0,
                    stats: {
                        activeWorkflows: 0,
                        totalExecutions: 0,
                        successRate: 0,
                        avgROI: 0,
                        timeSaved: '0 hours/month',
                    },
                    businessProfile: null,
                    aiMemory: null,
                };
                setPartners(prev => [...prev, newPartner]);

            } else {
                console.error("Failed to create tenant:", result.message);
                // Optionally show a toast notification with the error.
            }
        } catch (e) {
            console.error("Error calling createTenant flow:", e);
        }

        setIsAddModalOpen(false);
    };

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex-1 flex overflow-hidden">
                    {/* Partner List */}
                    <div className="w-1/3 border-r overflow-y-auto">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Partners ({partners.length})</h2>
                                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invite
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search partners..." className="pl-8" />
                                </div>
                                <Button variant="outline" size="icon" className="w-9 h-9">
                                    <ListFilter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {partners.map(partner => (
                                <PartnerCard 
                                    key={partner.id}
                                    partner={partner}
                                    isSelected={selectedPartner?.id === partner.id}
                                    onSelect={() => setSelectedPartner(partner)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Partner Detail View */}
                    <div className="w-2/3 overflow-y-auto">
                        {selectedPartner ? (
                            <PartnerDetailView partner={selectedPartner} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a partner to see details
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddPartner={handleAddPartner}
            />
        </>
    );
}
