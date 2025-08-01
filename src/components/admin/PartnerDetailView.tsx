// src/components/admin/PartnerDetailView.tsx
"use client";

import React, { useState } from 'react';
import type { Partner } from '@/lib/types';
import { Building, FileText, Brain, Zap } from 'lucide-react';
import PartnerOverview from './PartnerOverview';
import PartnerBusinessProfile from './PartnerBusinessProfile';
import PartnerAIMemory from './PartnerAIMemory';
import { Card, CardContent } from '@/components/ui/card';

interface PartnerDetailViewProps {
  partner: Partner;
}

export default function PartnerDetailView({ partner }: PartnerDetailViewProps) {
  const [view, setView] = useState('overview'); // overview, profile, ai-memory, workflows

  const industry = partner.industry || { name: 'N/A', icon: '🏢' };

  const renderContent = () => {
    switch (view) {
      case 'profile':
        if (!partner.businessProfile) {
          return (
             <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Business Profile</h3>
                <p>This partner has not completed their business profile yet.</p>
              </CardContent>
            </Card>
          )
        }
        return <PartnerBusinessProfile partner={partner} />;
      case 'ai-memory':
         if (!partner.aiMemory) {
          return (
             <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No AI Memory</h3>
                <p>AI insights will be generated as the partner uses workflows.</p>
              </CardContent>
            </Card>
          )
        }
        return <PartnerAIMemory partner={partner} />;
      case 'workflows':
        return (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Workflow management view coming soon...</p>
          </div>
        );
      case 'overview':
      default:
        return <PartnerOverview partner={partner} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Partner Header */}
      <div className="bg-card border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xl`}>
              {industry.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{partner.name}</h2>
              <p className="text-muted-foreground">{industry.name} • {partner.location.city}, {partner.location.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {partner.status}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mt-6 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'profile', label: 'Business Profile', icon: FileText },
            { id: 'ai-memory', label: 'AI Memory', icon: Brain },
            { id: 'workflows', label: 'Workflows', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                view === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
