
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Partner } from '@/lib/types';
import PartnerCard from "@/components/admin/PartnerCard";
import PartnerDetailView from "@/components/admin/PartnerDetailView";
import { UserPlus, Search, ListFilter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPartnerModal from "@/components/admin/AddPartnerModal";
import { Card, CardContent } from '@/components/ui/card';
import { createTenant } from '@/ai/flows/create-tenant-flow';
import { useToast } from "@/hooks/use-toast";
import { updatePartner } from '@/ai/flows/update-partner-flow';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface PartnerManagementUIProps {
    initialPartners: Partner[];
    error?: string | null;
}

export default function PartnerManagementUI({ initialPartners = [], error = null }: PartnerManagementUIProps) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    // Set up a real-time listener for the partners collection
    useEffect(() => {
        setIsLoading(true);
        if (!db) {
            console.error("Firestore not initialized");
            setIsLoading(false);
            return;
        }
        const q = query(collection(db, "partners"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const partnersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert timestamps to strings if they exist
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                } as Partner;
            });
            
            // Sort partners client-side
            partnersData.sort((a, b) => a.name.localeCompare(b.name));
            
            setPartners(partnersData);

            if (!selectedPartner && partnersData.length > 0) {
                setSelectedPartner(partnersData[0]);
            } else if (selectedPartner) {
                // Refresh selected partner data if it has been updated
                const updatedSelected = partnersData.find(p => p.id === selectedPartner.id);
                setSelectedPartner(updatedSelected || null);
            }
            
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching partners:", err);
            toast({
                variant: "destructive",
                title: "Error fetching partners",
                description: err.message,
            });
            setIsLoading(false);
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, [toast]);

    useEffect(() => {
        if (!selectedPartner && partners.length > 0) {
            setSelectedPartner(partners[0]);
        }
    }, [partners, selectedPartner]);

    // Filter partners based on search query and status
    const filteredPartners = useMemo(() => partners.filter(partner => {
        const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (partner.businessName && partner.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            partner.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    }), [partners, searchQuery, filterStatus]);

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

    const handleAddPartner = async (newPartnerData: { name: string; email: string; }) => {
        console.log("Adding new partner:", newPartnerData.name);
        try {
            // Call the unified Genkit flow to handle tenant and partner creation
            const result = await createTenant({ 
                partnerName: newPartnerData.name, 
                email: newPartnerData.email 
            });

            if (result.success) {
                toast({ 
                    title: "Partner Added", 
                    description: result.message
                });
                // The real-time listener will automatically update the UI with the new partner.
                // We can optionally select the new partner here.
                // The new partner data isn't returned directly, so we'll let the listener handle it.
            } else {
                console.error("Failed to create partner:", result.message);
                toast({ 
                    variant: "destructive", 
                    title: "Partner Creation Failed", 
                    description: result.message 
                });
            }
        } catch (e) {
            console.error("Error creating partner:", e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: `Could not create partner: ${errorMessage}` 
            });
        }
        setIsAddModalOpen(false);
    };

    const handleUpdatePartner = async (updatedPartner: Partner) => {
        try {
            const result = await updatePartner(JSON.stringify(updatedPartner));
            if (result.success) {
                toast({ 
                    title: "Partner Updated", 
                    description: result.message 
                });
                // The real-time listener will update the UI automatically.
            } else {
                toast({ 
                    variant: "destructive", 
                    title: "Update Failed", 
                    description: result.message 
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ 
                variant: "destructive", 
                title: "Update Error", 
                description: errorMessage 
            });
        }
    };
    
    const handleDeletePartner = () => {
        setSelectedPartner(null);
    };

    const handleStatusFilterChange = (status: string) => {
        setFilterStatus(status);
    };

    const getStatusCounts = () => {
        return {
            all: partners.length,
            active: partners.filter(p => p.status === 'active').length,
            pending: partners.filter(p => p.status === 'pending').length,
            suspended: partners.filter(p => p.status === 'suspended').length,
        };
    };

    const statusCounts = getStatusCounts();

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex-1 flex overflow-hidden">
                    {/* Partner List */}
                    <div className="w-1/3 border-r overflow-y-auto">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    Partners ({partners.length})
                                </h2>
                                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create
                                </Button>
                            </div>
                            
                            {/* Search Input */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search partners..." 
                                        className="pl-8" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="w-9 h-9">
                                    <ListFilter className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex gap-1">
                                {[
                                    { key: 'all', label: 'All', count: statusCounts.all },
                                    { key: 'active', label: 'Active', count: statusCounts.active },
                                    { key: 'pending', label: 'Pending', count: statusCounts.pending },
                                    { key: 'suspended', label: 'Suspended', count: statusCounts.suspended },
                                ].map(({ key, label, count }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleStatusFilterChange(key)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                            filterStatus === key
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                    >
                                        {label} ({count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Partner List */}
                        <div className="p-4 space-y-4">
                            {isLoading ? (
                                <p className="text-center text-muted-foreground p-4">Loading partners...</p>
                            ) : filteredPartners.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No partners found matching your criteria.</p>
                                </div>
                            ) : (
                                filteredPartners.map(partner => (
                                    <PartnerCard 
                                        key={partner.id}
                                        partner={partner}
                                        isSelected={selectedPartner?.id === partner.id}
                                        onSelect={() => setSelectedPartner(partner)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Partner Detail View */}
                    <div className="w-2/3 overflow-y-auto">
                        {selectedPartner ? (
                            <PartnerDetailView 
                                partner={selectedPartner} 
                                onUpdatePartner={handleUpdatePartner}
                                onDeletePartner={handleDeletePartner}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-muted-foreground">
                                    <UserPlus className="w-12 h-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Partner Selected</h3>
                                    <p>Select a partner from the list to view details.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Partner Modal */}
            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddPartner}
            />
        </>
    );
}
