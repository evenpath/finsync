// src/components/partner/team/InviteEmployeeDialog.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { inviteEmployeeAction } from '../../../actions/partner-actions';
import { useAuth } from '../../../hooks/use-auth';

interface InviteEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteEmployeeDialog({
  isOpen,
  onClose,
}: InviteEmployeeDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'partner_admin'>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const partnerId = user?.customClaims?.activePartnerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
        toast({ variant: "destructive", title: "Error", description: "Active partner not found." });
        return;
    }
    
    setIsSubmitting(true);

    try {
      const result = await inviteEmployeeAction({
        name,
        phone,
        email,
        role,
        partnerId,
      });

      if (result.success) {
        toast({
          title: 'Invitation Sent',
          description: `An invitation has been sent to ${name}.`
        });
        resetAndClose();
      } else {
        toast({
            variant: "destructive",
            title: 'Invitation Failed',
            description: result.message
        });
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send invitation. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('employee');
    onClose();
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetAndClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            The user will receive an SMS to join your workspace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+15551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
              />
               <p className="text-xs text-muted-foreground">
                Must be in E.164 format (e.g., +15551234567).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value: 'employee' | 'partner_admin') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="partner_admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name || !phone}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
