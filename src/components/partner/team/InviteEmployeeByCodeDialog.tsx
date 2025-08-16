// src/components/partner/team/InviteEmployeeByCodeDialog.tsx
"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { UserPlus, Phone, Loader2, Check, Copy, Ticket } from 'lucide-react';
import { generateEmployeeInvitationCodeAction } from '../../../actions/partner-invitation-management';
import { useAuth } from '../../../hooks/use-auth';

interface InviteEmployeeByCodeDialogProps {
  partnerId: string;
  onSuccess?: () => void;
}

export default function InviteEmployeeByCodeDialog({ partnerId, onSuccess }: InviteEmployeeByCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'employee' | 'partner_admin'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const resetForm = () => {
    setName('');
    setPhone('');
    setRole('employee');
    setGeneratedCode(null);
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    
    setIsLoading(true);
    setGeneratedCode(null);

    try {
      const result = await generateEmployeeInvitationCodeAction({
        phoneNumber: phone,
        name: name,
        partnerId: partnerId,
        role: role,
        invitedBy: user.uid,
      });

      if (result.success && result.invitationCode) {
        setGeneratedCode(result.invitationCode);
        toast({ title: 'Invitation code generated!' });
        onSuccess?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to generate code',
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({ title: 'Code copied to clipboard!' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!generatedCode ? (
          <form onSubmit={handleGenerateCode}>
            <DialogHeader>
              <DialogTitle>Generate Invitation Code</DialogTitle>
              <DialogDescription>
                Create a unique code for a new employee to join your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Employee's Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Employee's Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="partner_admin">Partner Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                Code Generated Successfully!
              </DialogTitle>
              <DialogDescription>
                Share this code with the employee to join your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Invitation Code</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {generatedCode}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Employee:</strong> {name}</p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Role:</strong> {role}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}