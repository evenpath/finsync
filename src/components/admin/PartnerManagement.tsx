
// src/components/admin/PartnerManagement.tsx
"use client";

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { mockPartners } from '@/lib/mockData';
import type { Partner } from '@/lib/types';
import PartnerCard from './PartnerCard';
import PartnerDetailView from './PartnerDetailView';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const industries = [
  { value: 'all', label: 'All Industries' },
  { value: 'Property Management', label: 'Property Management' },
  { value: 'HVAC Services', label: 'HVAC Services' },
  { value: 'Hotels', label: 'Hotels & Hospitality' },
  { value: 'other', label: 'Other' }
];

export default function PartnerManagement() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(mockPartners[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || 
                          (partner.industry && partner.industry.name.toLowerCase().includes(filterIndustry.toLowerCase()));
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="h-full flex flex-col">
      <header className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partner Management</h1>
            <p className="text-muted-foreground mt-1">Build comprehensive business profiles for AI-powered workflows</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Partners List */}
        <div className="w-1/3 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
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
                  {industries.map(industry => (
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
            {filteredPartners.map(partner => (
              <PartnerCard 
                key={partner.id} 
                partner={partner}
                isSelected={selectedPartner?.id === partner.id}
                onSelect={() => setSelectedPartner(partner)} 
              />
            ))}
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
    </div>
  );
}
