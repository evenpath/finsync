// src/components/admin/PartnerDetailView.tsx
import React from 'react';
import type { Partner } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2, Users, Mail, Phone, MapPin, Calendar, TrendingUp, Workflow, Target, Clock, DollarSign, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import PartnerOverview from './PartnerOverview';
import PartnerBusinessProfile from './PartnerBusinessProfile';
import PartnerAIMemory from './PartnerAIMemory';

interface PartnerDetailViewProps {
  partner: Partner;
}

export default function PartnerDetailView({ partner }: PartnerDetailViewProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'text-purple-600 bg-purple-50';
      case 'Professional': return 'text-blue-600 bg-blue-50';
      case 'Starter': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{partner.name}</CardTitle>
                  <p className="text-muted-foreground">{partner.industry?.name || 'Industry not set'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
               <div className={`px-3 py-1 text-xs font-medium rounded-full ${getPlanColor(partner.plan)}`}>
                  {partner.plan} Plan
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(partner.status)}`}></span>
                  {partner.status}
                </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
          <TabsTrigger value="profile"><Users className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
          <TabsTrigger value="ai_memory"><Workflow className="w-4 h-4 mr-2"/>AI Memory</TabsTrigger>
          <TabsTrigger value="workflows"><Target className="w-4 h-4 mr-2"/>Workflows</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <PartnerOverview partner={partner} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
            <PartnerBusinessProfile partner={partner} />
        </TabsContent>
        <TabsContent value="ai_memory" className="mt-6">
            <PartnerAIMemory partner={partner} />
        </TabsContent>
         <TabsContent value="workflows" className="mt-6">
            <Card>
                <CardHeader><CardTitle>Workflows</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Workflow details will be shown here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
