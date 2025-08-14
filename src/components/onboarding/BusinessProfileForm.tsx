
"use client";

import React, { useState } from 'react';
import type { Industry, BusinessProfile } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface BusinessProfileFormProps {
  industry: Industry;
  onProfileComplete: (profile: Partial<BusinessProfile>) => void;
}

export default function BusinessProfileForm({ industry, onProfileComplete }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessSize: 'small' as const,
    employeeCount: '',
    locationCity: '',
    locationState: '',
    painPoints: [] as string[],
    goals: [] as string[],
    monthlyRevenueRange: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileComplete(formData);
  };

  const commonPainPoints = industry.slug === 'property-management' 
    ? [
        'Emergency maintenance calls at all hours',
        'Tenant rent collection issues',
        'Poor communication with tenants',
        'Maintenance request tracking',
        'Tenant screening and onboarding'
      ]
    : industry.slug === 'hvac-services' 
    ? [
        'Emergency service dispatch and scheduling',
        'Managing technician availability',
        'Quoting and invoicing jobs',
        'Inventory tracking for parts',
        'Seasonal maintenance reminders'
    ] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Business Name</Label>
          <Input 
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            placeholder={industry.name === 'Property Management' ? "e.g., Acme Properties" : "Your Company Name"}
            required
          />
        </div>
        <div>
          <Label>Business Size</Label>
          <Select value={formData.businessSize} onValueChange={(value) => setFormData({...formData, businessSize: value as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (1-20 employees)</SelectItem>
              <SelectItem value="medium">Medium (21-100 employees)</SelectItem>
              <SelectItem value="large">Large (100+ employees)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pain Points Selection */}
      <div>
        <Label className="text-lg font-medium">What are your biggest operational challenges? (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {commonPainPoints.map(painPoint => (
            <div key={painPoint} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary">
              <Checkbox 
                id={painPoint}
                checked={formData.painPoints.includes(painPoint)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({...formData, painPoints: [...formData.painPoints, painPoint]});
                  } else {
                    setFormData({...formData, painPoints: formData.painPoints.filter(p => p !== painPoint)});
                  }
                }}
              />
              <Label htmlFor={painPoint} className="flex-1 cursor-pointer">{painPoint}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Continue to Workflow Recommendations
      </Button>
    </form>
  );
}
