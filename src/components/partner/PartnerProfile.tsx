"use client";

import React from 'react';
import type { Partner } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Building, Users, MapPin, DollarSign, Mail, Phone, Calendar, Star, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';

interface PartnerProfileProps {
  partner: Partner;
}

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
    <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold text-foreground mt-1">{value || 'Not specified'}</dd>
    </div>
  </div>
);

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = "blue" 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  color?: string;
}) => (
  <div className="flex items-center gap-3 p-4 bg-card border rounded-lg">
    <div className={`p-2 rounded-lg bg-${color}-50`}>
      <Icon className={`w-6 h-6 text-${color}-600`} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default function PartnerProfile({ partner }: PartnerProfileProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{partner.name || partner.businessName}</CardTitle>
              <p className="text-muted-foreground mt-1">Organization Profile</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(partner.status)}>
                {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
              </Badge>
              <Badge className={getPlanColor(partner.plan)}>
                {partner.plan}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem 
              icon={Building} 
              label="Business Name" 
              value={partner.businessName} 
            />
            <InfoItem 
              icon={Users} 
              label="Contact Person" 
              value={partner.contactPerson} 
            />
            <InfoItem 
              icon={Mail} 
              label="Email" 
              value={partner.email} 
            />
            <InfoItem 
              icon={Phone} 
              label="Phone" 
              value={partner.phone || 'Not provided'} 
            />
            <InfoItem 
              icon={MapPin} 
              label="Location" 
              value={partner.location ? `${partner.location.city}, ${partner.location.state}` : 'Not specified'} 
            />
            <InfoItem 
              icon={Calendar} 
              label="Joined Date" 
              value={partner.joinedDate ? new Date(partner.joinedDate).toLocaleDateString() : 'Unknown'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem 
              icon={Building} 
              label="Industry" 
              value={partner.industry?.name || 'Not specified'} 
            />
            <InfoItem 
              icon={Users} 
              label="Business Size" 
              value={partner.businessSize} 
            />
            <InfoItem 
              icon={Users} 
              label="Employee Count" 
              value={partner.employeeCount} 
            />
            <InfoItem 
              icon={DollarSign} 
              label="Monthly Revenue" 
              value={partner.monthlyRevenue ? `$${partner.monthlyRevenue}` : 'Not disclosed'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      {partner.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={TrendingUp} 
                label="Active Workflows" 
                value={partner.stats.activeWorkflows} 
                color="blue"
              />
              <StatCard 
                icon={CheckCircle} 
                label="Success Rate" 
                value={`${partner.stats.successRate}%`} 
                color="green"
              />
              <StatCard 
                icon={Target} 
                label="Total Executions" 
                value={partner.stats.totalExecutions} 
                color="purple"
              />
              <StatCard 
                icon={Clock} 
                label="Time Saved" 
                value={partner.stats.timeSaved} 
                color="orange"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Profile Completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            AI Profile Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${partner.aiProfileCompleteness}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {partner.aiProfileCompleteness}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Complete your profile to get better AI recommendations
          </p>
        </CardContent>
      </Card>

      {/* Business Profile Details */}
      {partner.businessProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Business Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pain Points */}
              {partner.businessProfile.painPoints && partner.businessProfile.painPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Current Challenges
                  </h4>
                  <ul className="space-y-2">
                    {partner.businessProfile.painPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Goals */}
              {partner.businessProfile.goals && partner.businessProfile.goals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Business Goals
                  </h4>
                  <ul className="space-y-2">
                    {partner.businessProfile.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}