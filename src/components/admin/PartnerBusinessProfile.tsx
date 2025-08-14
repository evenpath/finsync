
// src/components/admin/PartnerBusinessProfile.tsx
import React from 'react';
import type { Partner } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Building, Users, MapPin, DollarSign, Mail, Phone, Calendar, Star, AlertCircle, Settings, Target } from 'lucide-react';

interface PartnerBusinessProfileProps {
  partner: Partner;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: React.ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" />
            {label}
        </dt>
        <dd className="text-md font-semibold text-foreground">{value || 'N/A'}</dd>
    </div>
);

export default function PartnerBusinessProfile({ partner }: PartnerBusinessProfileProps) {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Context & Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <InfoItem icon={Building} label="Business Name" value={partner.businessName} />
            <InfoItem icon={Users} label="Employees" value={`${partner.employeeCount} (${partner.businessSize})`} />
            <InfoItem icon={MapPin} label="Location" value={`${partner.location.city}, ${partner.location.state}`} />
            <InfoItem icon={DollarSign} label="Monthly Revenue" value={`$${partner.monthlyRevenue}`} />
            <InfoItem icon={Users} label="Contact Person" value={partner.contactPerson} />
            <InfoItem icon={Mail} label="Contact Email" value={partner.email} />
            <InfoItem icon={Phone} label="Phone Number" value={partner.phone} />
            <InfoItem icon={Calendar} label="Joined Date" value={new Date(partner.joinedDate).toLocaleDateString()} />
          </dl>
        </CardContent>
      </Card>
      
      {partner.businessProfile && (
        <>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Current Pain Points</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.businessProfile.painPoints.map((point, index) => (
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
                {partner.businessProfile.currentTools.map((tool, index) => (
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
                {partner.businessProfile.goals.map((goal, index) => (
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
        </>
      )}
    </div>
  );
}
