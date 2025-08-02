// ============================================================================
// 5. src/components/admin/PartnerCreationDialog.tsx (new)
// ============================================================================
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { createTenant } from '@/ai/flows/create-tenant-flow';

interface PartnerCreationDialogProps {
  onPartnerCreated?: () => void;
}

export default function PartnerCreationDialog({ onPartnerCreated }: PartnerCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    phone: '',
    industry: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createTenant({
        partnerName: formData.name,
        email: formData.email
      });

      if (result.success) {
        // Update additional details if provided
        if (formData.businessName || formData.phone || formData.industry) {
          try {
            await fetch(`/api/partners/${result.partnerId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessName: formData.businessName || formData.name,
                phone: formData.phone,
                industry: formData.industry || null,
              }),
            });
          } catch (updateError) {
            console.warn("Failed to update additional partner details:", updateError);
          }
        }

        toast({
          title: "Partner Created",
          description: result.message
        });
        
        setFormData({
          name: '',
          email: '',
          businessName: '',
          phone: '',
          industry: ''
        });
        setOpen(false);
        onPartnerCreated?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error creating partner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create partner"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Partner</DialogTitle>
            <DialogDescription>
              Create a new partner organization with its own workspace and authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Acme Property Management"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Admin Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@acme.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Acme Property Management LLC"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Property Management"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Partner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}