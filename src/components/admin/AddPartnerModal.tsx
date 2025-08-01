// src/components/admin/AddPartnerModal.tsx
"use client";

import React, { useState } from 'react';
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
import { UserPlus } from 'lucide-react';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPartner: (partnerData: { name: string }) => void;
}

export default function AddPartnerModal({ isOpen, onClose, onAddPartner }: AddPartnerModalProps) {
  const [partnerName, setPartnerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPartner({ name: partnerName });
    handleClose();
  };
  
  const handleClose = () => {
    setPartnerName('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus />
              Create New Partner
            </DialogTitle>
            <DialogDescription>
             Enter the business name for the new partner organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
             <div className="space-y-2">
                <Label htmlFor="name">
                    Business Name
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g., Sunnyvale Properties"
                    required
                />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!partnerName.trim()}>
                Create Partner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
