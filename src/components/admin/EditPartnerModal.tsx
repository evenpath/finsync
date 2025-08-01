// src/components/admin/EditPartnerModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from 'lucide-react';
import type { Partner } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface EditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onSave: (partnerData: Partner) => void;
}

export default function EditPartnerModal({ isOpen, onClose, partner, onSave }: EditPartnerModalProps) {
  const [formData, setFormData] = useState<Partner>(partner);
  const { toast } = useToast();
  
  useEffect(() => {
    setFormData(partner);
  }, [partner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };
  
  const handleNestedInputChange = (parentKey: 'location' | 'stats', nestedKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [nestedKey]: value
      }
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
        title: "Partner Details Saved",
        description: "The changes have been saved successfully.",
    });
  };
  
  const handleClose = () => {
    onClose();
  }

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Edit />
              Edit Partner: {partner.name}
            </DialogTitle>
            <DialogDescription>
             Update the details for this partner organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Partner Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
               <div>
                <Label htmlFor="joinedDate">Joined Date</Label>
                <Input id="joinedDate" name="joinedDate" type="date" value={new Date(formData.joinedDate).toISOString().split('T')[0]} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.location.city} onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.location.state} onChange={(e) => handleNestedInputChange('location', 'state', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="plan">Plan</Label>
                    <Select name="plan" value={formData.plan} onValueChange={(value) => handleSelectChange('plan', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                     <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="businessSize">Business Size</Label>
                     <Select name="businessSize" value={formData.businessSize} onValueChange={(value) => handleSelectChange('businessSize', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input id="employeeCount" name="employeeCount" type="number" value={formData.employeeCount} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
                <Input id="monthlyRevenue" name="monthlyRevenue" value={formData.monthlyRevenue} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="aiProfileCompleteness">AI Profile %</Label>
                <Input id="aiProfileCompleteness" name="aiProfileCompleteness" type="number" value={formData.aiProfileCompleteness} onChange={handleInputChange} />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
