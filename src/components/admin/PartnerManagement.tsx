// src/components/admin/PartnerManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { Search, Plus, Users } from 'lucide-react';
import { industries, mockPartners } from '@/lib/mockData';
import type { Partner, Industry } from '@/lib/types';
import PartnerCard from './PartnerCard';
import PartnerDetailView from './PartnerDetailView';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AddPartnerModal from './AddPartnerModal';
import { useToast } from '@/hooks/use-toast';
import { createTenant } from '@/ai/flows/create-tenant-flow';


const industryOptions = [
  { value: 'all', label: 'All Industries' },
  { value: 'Property Management', label: 'Property Management' },
  { value: 'HVAC Services', label: 'HVAC Services' },
  { value: 'Hotels', label: 'Hotels & Hospitality' },
  { value: 'other', label: 'Other' }
];

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const partnersCollection = collection(db, 'partners');
        const partnerSnapshot = await getDocs(partnersCollection);
        if (partnerSnapshot.empty) {
          // If the collection is empty, seed it with mock data
          console.log("Partners collection is empty, seeding with mock data...");
          for (const partner of mockPartners) {
            await addDoc(collection(db, "partners"), partner);
          }
          // Fetch again after seeding
           const seededSnapshot = await getDocs(partnersCollection);
           const partnersList = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
           setPartners(partnersList);
           if (partnersList.length > 0) {
              setSelectedPartner(partnersList[0]);
           }
        } else {
          const partnersList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
          setPartners(partnersList);
           if (partnersList.length > 0) {
              setSelectedPartner(partnersList[0]);
           }
        }
      } catch (error) {
        console.error("Error fetching partners: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching partners",
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPartners();
  }, [toast]);

  const handleAddPartner = async (partnerData: any) => {
    try {
      // Step 1: Call the Genkit flow to create a tenant
      const tenantResult = await createTenant({ partnerName: partnerData.name });

      if (!tenantResult.success || !tenantResult.tenantId) {
        throw new Error(tenantResult.message || "Failed to create tenant.");
      }

      toast({
        title: "Tenant Created",
        description: tenantResult.message,
      });

      // Step 2: Create the partner object and add to Firestore
      const selectedIndustry = industries.find(i => i.id === partnerData.industryId) as Industry;

      const newPartner: Omit<Partner, 'id'> = {
        name: partnerData.name,
        tenantId: tenantResult.tenantId,
        contactPerson: partnerData.name,
        email: partnerData.email,
        businessName: partnerData.name,
        phone: '',
        status: 'active',
        plan: partnerData.plan,
        joinedDate: new Date().toISOString(),
        industry: selectedIndustry,
        businessSize: 'small',
        employeeCount: 0,
        monthlyRevenue: '0',
        location: { city: partnerData.outlets[0]?.address.split(',')[1]?.trim() || '', state: partnerData.outlets[0]?.address.split(',')[2]?.trim().split(' ')[0] || ''},
        aiProfileCompleteness: 0,
        stats: {
          activeWorkflows: 0,
          totalExecutions: 0,
          successRate: 0,
          avgROI: 0,
          timeSaved: "0 hours/month",
        },
        businessProfile: null,
        aiMemory: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "partners"), newPartner);
      const createdPartner = { id: docRef.id, ...newPartner } as Partner;
      
      setPartners(prev => [...prev, createdPartner]);
      setSelectedPartner(createdPartner);
      setIsModalOpen(false);

      toast({
        title: "Partner Added",
        description: `${partnerData.name} has been successfully added to Firestore.`,
      });

    } catch (error) {
      console.error("Error adding partner:", error);
      toast({
        variant: "destructive",
        title: "Error adding partner",
        description: (error as Error).message || "An unexpected error occurred.",
      });
    }
  };
  
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || 
                          (partner.industry && partner.industry.name.toLowerCase().includes(filterIndustry.toLowerCase()));
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Partners List */}
        <div className="w-1/3 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Partners</h2>
                <Button onClick={() => setIsModalOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partner
                </Button>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{filteredPartners.length} partners</span>
              <span>•</span>
              <span>{filteredPartners.filter(p => p.status === 'active').length} active</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {isLoading ? (
              <p>Loading partners...</p>
            ) : filteredPartners.length > 0 ? (
              filteredPartners.map(partner => (
                <PartnerCard 
                  key={partner.id} 
                  partner={partner}
                  isSelected={selectedPartner?.id === partner.id}
                  onSelect={() => setSelectedPartner(partner)} 
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground p-8">No partners found.</p>
            )}
          </div>
        </div>

        {/* Partner Details */}
        <div className="flex-1 bg-secondary/30 overflow-y-auto">
          {selectedPartner ? (
            <PartnerDetailView partner={selectedPartner} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Partner</h3>
                <p className="text-muted-foreground">Choose a partner from the list to view their detailed business profile and AI insights</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddPartnerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPartner={handleAddPartner}
      />
    </div>
  );
}
