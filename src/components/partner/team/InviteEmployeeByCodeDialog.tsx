"use client";

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

interface InviteEmployeeByCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
}

export default function InviteEmployeeByCodeDialog({
  isOpen,
  onClose,
  partnerId
}: InviteEmployeeByCodeDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'employee' | 'partner_admin'>('employee');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock invitation creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      toast({
        title: 'Invitation Created',
        description: `Invitation code ${mockCode} created for ${phoneNumber}. The code expires in ${expiresInDays} days.`
      });

      // Reset form
      setPhoneNumber('');
      setRole('employee');
      setExpiresInDays('7');
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create invitation. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPhoneNumber('');
      setRole('employee');
      setExpiresInDays('7');
      onClose();
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
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                The invitation code will be sent to this phone number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value: 'employee' | 'partner_admin') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="partner_admin">Partner Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresIn">Code Expires In</Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !phoneNumber}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}