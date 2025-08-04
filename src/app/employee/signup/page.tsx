
// src/app/employee/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getTenantForEmailAction } from '@/actions/auth-actions';

export default function EmployeeSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use a conventional email format to look up the organization's tenant.
      // In a real application, this might be a direct lookup on the code itself.
      const domainEmail = `admin@${organizationCode}`;
      
      const tenantLookup = await getTenantForEmailAction(domainEmail);
      
      if (!tenantLookup.success || !tenantLookup.tenantId || !tenantLookup.partnerId) {
        throw new Error("Organization not found. Please check your organization code or contact your admin.");
      }

      // Create the user as an 'employee' in the found tenant.
      const userResult = await createUserInTenant({
        email,
        password,
        tenantId: tenantLookup.tenantId,
        displayName: name,
        partnerId: tenantLookup.partnerId,
        role: 'employee',
      });

      if (!userResult.success) {
        throw new Error(userResult.message || "Failed to create your account.");
      }

      toast({
        title: "Account Created!",
        description: "You can now sign in to access your workspace.",
      });

      router.push('/partner/login');

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
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Join Your Team</CardTitle>
            <CardDescription>Enter your details and organization code to get started.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="organizationCode">Organization Code</Label>
              <Input 
                id="organizationCode" 
                type="text" 
                placeholder="your-company-code" 
                required 
                value={organizationCode}
                onChange={(e) => setOrganizationCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Your Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
             <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/partner/login" className="underline">Sign in</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
