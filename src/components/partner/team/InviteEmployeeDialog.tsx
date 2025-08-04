// src/components/partner/team/InviteEmployeeDialog.tsx
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, UserPlus, Phone, Mail, Loader2, Check } from 'lucide-react';
import { inviteEmployeeAction } from '@/actions/partner-actions';
import { useAuth } from '@/hooks/use-auth';

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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const partnerId = user?.customClaims?.partnerId;

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('employee');
    setInviteMethod('phone');
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        phone: inviteMethod === 'phone' ? phone : undefined,
        email: inviteMethod === 'email' ? email : undefined,
        role
      });
      resetForm();
      onClose();
    } catch (error) {
      // Parent handles toast
    } finally {
      setIsLoading(false);
    }
  };

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
                  Phone
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="phone" className="space-y-4">
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
                  />
                  <p className="text-xs text-muted-foreground">
                    International format required (e.g., +1234567890)
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
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
            <Button type="submit" disabled={isLoading || !name.trim()}>
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
