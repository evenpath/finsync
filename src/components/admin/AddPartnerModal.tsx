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
  DialogClose,
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
import { UserPlus } from 'lucide-react';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPartner: (partnerData: any) => void;
}

export default function AddPartnerModal({ isOpen, onClose, onAddPartner }: AddPartnerModalProps) {
  const [partnerData, setPartnerData] = useState({
    name: '',
    email: '',
    plan: 'Starter',
    members: 1,
    workflows: 1,
    tasksCompleted: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPartnerData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setPartnerData(prev => ({ ...prev, plan: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPartner(partnerData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <UserPlus />
            Invite New Partner
          </DialogTitle>
          <DialogDescription>
            Enter the details of the new partner organization to send an invitation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Org Name
            </Label>
            <Input
              id="name"
              value={partnerData.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="e.g., Acme Corporation"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={partnerData.email}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="admin@acme.com"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">
              Plan
            </Label>
            <Select value={partnerData.plan} onValueChange={handleSelectChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
