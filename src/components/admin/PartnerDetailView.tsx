// src/components/admin/PartnerDetailView.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../shared/Badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Edit2,
  Save,
  X,
  Workflow,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import type { Partner } from '../../lib/types';

interface PartnerDetailViewProps {
  partner: Partner;
  onClose: () => void;
  onSave?: (updatedPartner: Partner) => void;
}

export default function PartnerDetailView({ partner, onClose, onSave }: PartnerDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPartner, setEditedPartner] = useState<Partner>(partner);

  const handleSave = () => {
    onSave?.(editedPartner);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPartner(partner);
    setIsEditing(false);
  };

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{partner.name}</h2>
            <p className="text-muted-foreground">{partner.businessName}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedPartner.name}
                        onChange={(e) => setEditedPartner({ ...editedPartner, name: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm">{partner.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    {isEditing ? (
                      <Input
                        id="businessName"
                        value={editedPartner.businessName}
                        onChange={(e) => setEditedPartner({ ...editedPartner, businessName: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm">{partner.businessName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedPartner.email}
                        onChange={(e) => setEditedPartner({ ...editedPartner, email: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {partner.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedPartner.phone}
                        onChange={(e) => setEditedPartner({ ...editedPartner, phone: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {partner.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(partner.joinedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <p className="mt-1 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {partner.location.city}, {partner.location.state}
                    </p>
                  </div>
                  <div>
                    <Label>Employee Count</Label>
                    <p className="mt-1 text-sm flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {partner.employeeCount} employees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 h-5 mr-2" />
                  Business Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{partner.stats.activeWorkflows}</div>
                    <div className="text-sm text-muted-foreground">Active Workflows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{partner.stats.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{partner.stats.avgROI}%</div>
                    <div className="text-sm text-muted-foreground">Avg ROI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{partner.stats.totalExecutions}</div>
                    <div className="text-sm text-muted-foreground">Total Executions</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">{partner.stats.timeSaved}</span>
                    <span className="text-sm text-muted-foreground ml-1">saved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Workflow className="h-4 w-4 mr-2" />
                  View Workflows
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label>Industry</Label>
                    <p className="text-sm">{partner.industry?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Business Size</Label>
                    <p className="text-sm capitalize">{partner.businessSize}</p>
                  </div>
                  <div>
                    <Label>Monthly Revenue</Label>
                    <p className="text-sm">{partner.monthlyRevenue}</p>
                  </div>
                  <div>
                    <Label>AI Profile</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${partner.aiProfileCompleteness}%` }}
                        />
                      </div>
                      <span className="text-sm">{partner.aiProfileCompleteness}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
