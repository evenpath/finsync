
// src/components/admin/PartnerBusinessProfile.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building, Users, MapPin, DollarSign, Mail, Phone, AlertCircle, Settings, Target, Calendar, Star } from 'lucide-react';

interface PartnerBusinessProfileProps {
  partner: Partner;
}

export default function PartnerBusinessProfile({ partner }: PartnerBusinessProfileProps) {
  const profile = partner.businessProfile;

  if (!profile) return <div>No business profile available.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Context & Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Basic Information</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><Building className="w-4 h-4" /><span>{partner.businessName}</span></div>
                <div className="flex items-center gap-3"><Users className="w-4 h-4" /><span>{partner.employeeCount} employees ({partner.businessSize})</span></div>
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /><span>{partner.location.city}, {partner.location.state}</span></div>
                <div className="flex items-center gap-3"><DollarSign className="w-4 h-4" /><span>{partner.monthlyRevenue}/month</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Contact Information</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><Users className="w-4 h-4" /><span>{partner.contactPerson}</span></div>
                <div className="flex items-center gap-3"><Mail className="w-4 h-4" /><span>{partner.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4" /><span>{partner.phone}</span></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Performance</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Success Rate</span><span className="font-medium text-green-600">{partner.stats.successRate}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg ROI</span><span className="font-medium text-blue-600">{partner.stats.avgROI}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time Saved</span><span className="font-medium text-purple-600">{partner.stats.timeSaved}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Current Pain Points</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.painPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p className="text-sm text-red-800">{point}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-blue-500" /> Current Tools & Systems</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profile.currentTools.map((tool, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-foreground">{tool.name}</h5>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < tool.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{tool.category}</p>
              <p className="text-sm font-medium text-green-600">${tool.monthlySpend}/month</p>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Business Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {profile.goals.map((goal, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">{goal.description}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {goal.priority} priority
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{goal.timeline}</span></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
