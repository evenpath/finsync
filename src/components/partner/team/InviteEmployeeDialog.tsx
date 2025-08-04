// src/components/partner/team/InviteEmployeeDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, UserPlus, Phone, Mail, Loader2, Check, AlertCircle } from 'lucide-react';
import { inviteEmployeeAction } from '@/actions/partner-actions';
import { useAuth } from '@/hooks/use-auth';
import { formatPhoneNumber, isValidPhoneNumber } from '@/utils/phone-utils';

interface InviteEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteMember: (memberData: { 
    name: string; 
    phone?: string; 
    email?: string;
    role: 'partner_admin' | 'employee' 
  }) => Promise<void>;
}

export default function InviteEmployeeDialog({ 
  isOpen, 
  onClose,
  onInviteMember
}: InviteEmployeeDialogProps) {
  const [inviteMethod, setInviteMethod] = useState<'phone' | 'email'>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'partner_admin'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const partnerId = user?.customClaims?.partnerId;

  useEffect(() => {
    if (phone) {
      setIsPhoneValid(isValidPhoneNumber(phone));
    } else {
      setIsPhoneValid(true);
    }
  }, [phone]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('employee');
    setInviteMethod('phone');
    setIsPhoneValid(true);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inviteMethod === 'phone' && !isPhoneValid) {
        toast({
            variant: 'destructive',
            title: 'Invalid Phone Number',
            description: 'Please enter a valid phone number in E.164 international format (e.g., +15551234567).'
        });
        return;
    }
    
    if (!partnerId) {
      toast({
        variant: "destructive",
        title: "Could not identify your organization."
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await onInviteMember({
        name,
        phone: inviteMethod === 'phone' ? formatPhoneNumber(phone) : undefined,
        email: inviteMethod === 'email' ? email : undefined,
        role
      });
      resetForm();
      onClose();
    } catch (error) {
      // Parent handles toast for API errors
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || !name.trim() || 
                           (inviteMethod === 'phone' && (!phone.trim() || !isPhoneValid)) ||
                           (inviteMethod === 'email' && !email.trim());


  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleInvite}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite New Employee
            </DialogTitle>
            <DialogDescription>
              Invite someone to join your team. They'll receive an invitation and can sign in using their phone or email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Tabs value={inviteMethod} onValueChange={(value) => setInviteMethod(value as 'phone' | 'email')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Invite by Phone
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Invite by Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="phone" className="space-y-2 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+15551234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    required={inviteMethod === 'phone'}
                    className={!isPhoneValid && phone ? 'border-destructive' : ''}
                  />
                  {!isPhoneValid && phone ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a valid E.164 phone number (e.g. +1234567890).
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                        International format required (e.g., +1234567890)
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-2 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="email-required">Email Address</Label>
                  <Input
                    id="email-required"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required={inviteMethod === 'email'}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'employee' | 'partner_admin')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="partner_admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admins can manage the workspace and invite other employees
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
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
