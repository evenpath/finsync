// src/components/admin/InviteAdminModal.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserPlus } from 'lucide-react';

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteUser: (userData: { name: string; email: string; role: 'Admin' | 'Super Admin' }) => void;
}

export default function InviteAdminModal({ isOpen, onClose, onInviteUser }: InviteAdminModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Super Admin'>('Admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setIsLoading(true);
      await onInviteUser({ name, email, role });
      setIsLoading(false);
      // Reset form upon successful submission in the parent component
    }
  };
  
  const handleClose = () => {
    if (isLoading) return;
    setName('');
    setEmail('');
    setRole('Admin');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus />
              Invite New Admin
            </DialogTitle>
            <DialogDescription>
              Enter the details for the new administrator and assign a role. An invitation will be sent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Jane Doe"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="jane.doe@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={(value: 'Admin' | 'Super Admin') => setRole(value)} disabled={isLoading}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || !email}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
