// src/app/(employee-auth)/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import { Phone, User, Building2, Mail } from 'lucide-react';
import { createEmployeeWithPhone } from '../../services/phone-auth-service';

export default function EmployeeSignupPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we'll use a simple invite code system
      // In production, this would validate against workspace invitations
      if (!inviteCode) {
        throw new Error("Please enter an invitation code from your organization.");
      }

      // Parse invite code (format: PARTNER_ID-TENANT_ID)
      const [partnerId, tenantId] = inviteCode.split('-');
      
      if (!partnerId || !tenantId) {
        throw new Error("Invalid invitation code format. Please check with your organization admin.");
      }

      // Create employee with phone number
      const result = await createEmployeeWithPhone({
        phoneNumber,
        displayName: name,
        email: email || undefined,
        partnerId,
        tenantId,
        role: 'employee',
        invitedBy: 'system' // In production, this would be the actual inviter's ID
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: "Account Created!",
        description: "You can now sign in using your phone number.",
      });

      router.push('/login');

    } catch (error: any) {
      console.error("Employee Signup Error:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSignup}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Join Your Team</CardTitle>
            <CardDescription>
              Create your account to join your organization's workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1 555-123-4567" 
                  required 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You'll use this number to sign in to your account.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inviteCode">Invitation Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="inviteCode" 
                  type="text" 
                  placeholder="ABC123-DEF456" 
                  required 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="pl-10 font-mono"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the invitation code provided by your organization admin.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
