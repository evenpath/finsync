// src/components/partner/InviteMemberModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Phone, Mail, RefreshCw, AlertCircle } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteMember: (memberData: { 
    name: string; 
    phone?: string; 
    email?: string;
    role: 'partner_admin' | 'employee' 
  }) => Promise<void>;
}

export default function InviteMemberModal({ isOpen, onClose, onInviteMember }: InviteMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'partner_admin' | 'employee'>('employee');
  const [inviteMethod, setInviteMethod] = useState<'phone' | 'email'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const contactMethod = inviteMethod === 'phone' ? phone.trim() : email.trim();
    if (!contactMethod) return;

    setIsSubmitting(true);
    try {
      const memberData = {
        name: name.trim(),
        role,
        ...(inviteMethod === 'phone' ? { phone: phone.trim() } : { email: email.trim() })
      };
      
      await onInviteMember(memberData);
      
      // Reset form on success
      setName('');
      setPhone('');
      setEmail('');
      setRole('employee');
      setInviteMethod('phone');
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form when closing
      setName('');
      setPhone('');
      setEmail('');
      setRole('employee');
      setInviteMethod('phone');
      onClose();
    }
  };

  const isValid = name.trim().length > 0 && 
    ((inviteMethod === 'phone' && phone.trim().length > 0) || 
     (inviteMethod === 'email' && email.trim().length > 0 && email.includes('@')));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Add a new member to your team. They will receive an invitation to join your workspace.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                New members will need to create an account and verify their contact information.
              </AlertDescription>
            </Alert>

            {/* Member Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* Contact Method Tabs */}
            <div className="space-y-3">
              <Label>Contact Method</Label>
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
                
                <TabsContent value="phone" className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required={inviteMethod === 'phone'}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    They will receive a text message with invitation details.
                  </p>
                </TabsContent>
                
                <TabsContent value="email" className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    required={inviteMethod === 'email'}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    They will receive an email with invitation details.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as 'partner_admin' | 'employee')}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="partner_admin">Partner Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === 'partner_admin' 
                  ? 'Can manage team members and workspace settings'
                  : 'Can access assigned tasks and workflows'
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Sending Invitation...
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