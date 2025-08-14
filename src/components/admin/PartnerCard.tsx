// src/components/admin/PartnerCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, TrendingUp, Calendar, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import type { Partner } from '@/lib/types';

interface PartnerCardProps {
  partner: Partner;
  onView?: (partner: Partner) => void;
  onEdit?: (partner: Partner) => void;
  onDelete?: (partner: Partner) => void;
}

export default function PartnerCard({ partner, onView, onEdit, onDelete }: PartnerCardProps) {
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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            {partner.name}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={partner.status === 'active' ? 'default' : 'secondary'}
              className={`${getStatusColor(partner.status)} text-white`}
            >
              {partner.status}
            </Badge>
            <Badge variant="outline" className={getPlanColor(partner.plan)}>
              {partner.plan}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onView?.(partner)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(partner)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete?.(partner)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {partner.businessName}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {partner.employeeCount} employees
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Joined {new Date(partner.joinedDate).toLocaleDateString()}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Workflows:</span>
              <span className="ml-1 font-medium">{partner.stats.activeWorkflows}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Success:</span>
              <span className="ml-1 font-medium text-green-600">{partner.stats.successRate}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">ROI:</span>
              <span className="ml-1 font-medium text-blue-600">{partner.stats.avgROI}%</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Saved:</span>
              <span className="ml-1 font-medium">{partner.stats.timeSaved}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}