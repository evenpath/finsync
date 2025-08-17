"use client";

import React, { useState } from 'react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Copy, Loader2, QrCode, Phone, User, Shield, CheckCircle, Mail, MessageSquare } from "lucide-react";
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/use-auth';
import { generateEmployeeInvitationCodeAction } from '../../../actions/partner-invitation-management';

interface GenerateInviteCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  onInviteGenerated: () => void;
}

export default function GenerateInviteCodeDialog({ 
  isOpen, 
  onClose, 
  partnerId, 
  onInviteGenerated 
}: GenerateInviteCodeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'employee' | 'partner_admin'>('employee');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated code state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeDetails, setCodeDetails] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and phone number are required"
      });
      return;
    }

    // Enhanced phone number validation
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, '');
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +1234567890)"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateEmployeeInvitationCodeAction({
        phoneNumber: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
        name: name.trim(),
        partnerId,
        role,
        invitedBy: user!.uid
      });

      if (result.success && result.invitationCode) {
        setGeneratedCode(result.invitationCode);
        setCodeDetails(result);
        toast({
          title: "Invitation Code Generated! 🎉",
          description: `Code ${result.invitationCode} created for ${name}`
        });
        onInviteGenerated();
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: result.message
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate invitation code"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied!",
        description: "Invitation code copied to clipboard"
      });
    }
  };

  const handleCopyInstructions = () => {
    if (generatedCode && name && phoneNumber) {
      const instructions = `Hi ${name}! You've been invited to join our workspace.

📱 Download the employee app
📞 Enter your phone number: ${phoneNumber}
🔑 Use invitation code: ${generatedCode}

The code expires in 7 days. Welcome to the team!`;
      
      navigator.clipboard.writeText(instructions);
      toast({
        title: "Instructions Copied!",
        description: "Share these instructions with the employee"
      });
    }
  };

  const handleReset = () => {
    setName('');
    setPhoneNumber('');
    setRole('employee');
    setGeneratedCode(null);
    setCodeDetails(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {generatedCode ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Invitation Code Generated
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Generate Invitation Code
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {generatedCode 
              ? 'Share this code with the employee to join your workspace'
              : 'Create an invitation code for a new team member'
            }
          </DialogDescription>
        </DialogHeader>

        {!generatedCode ? (
          // Form for generating code
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Employee Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter employee name..."
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +1 for US/Canada)
              </p>
            </div>

            <div>
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </Label>
              <Select value={role} onValueChange={(value: 'employee' | 'partner_admin') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="partner_admin">Partner Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {role === 'partner_admin' 
                  ? 'Can manage team members and create tasks'
                  : 'Can view assigned tasks and update their status'
                }
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Code'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // Display generated code
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Code Generated Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Share this with {name} to join your workspace
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-3xl font-mono font-bold tracking-wider text-primary mb-2">
                  {generatedCode}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyCode}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyInstructions}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Copy Instructions
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {codeDetails?.expiresAt 
                      ? new Date(codeDetails.expiresAt).toLocaleDateString()
                      : '7 days'
                    }
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Employee Instructions:</strong><br/>
                  1. Download the employee app<br/>
                  2. Enter phone number: {phoneNumber}<br/>
                  3. Use invitation code: <strong>{generatedCode}</strong><br/>
                  4. Complete phone verification
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleReset} className="w-full">
                Generate Another Code
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}