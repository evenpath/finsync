
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../hooks/use-toast";
import { createUserInTenant } from '../../../ai/flows/user-management-flow';
import { getTenantForEmailAction } from '../../../actions/auth-actions';

export default function JoinPartnerPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For organization code approach - you could implement a lookup
      // For now, we'll use email domain to find the organization
      const domainEmail = `admin@${organizationCode}`;
      
      const tenantLookup = await getTenantForEmailAction(domainEmail);
      
      if (!tenantLookup.success || !tenantLookup.tenantId) {
        throw new Error("Organization not found. Please check your organization code or contact your admin.");
      }

      const userResult = await createUserInTenant({
        email: email,
        password: password,
        tenantId: tenantLookup.tenantId,
        displayName: name,
        partnerId: tenantLookup.tenantId,
      });

      if (!userResult.success) {
        throw new Error(userResult.message || "Failed to create account.");
      }

      toast({
        title: "Account Created!",
        description: "You can now sign in to access your workspace.",
      });

      router.push('/partner/login');

    } catch (error: any) {
      console.error("Join Error:", error);
      
      let errorMessage = "Failed to join organization. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Join Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-sm">
        <form onSubmit={handleJoin}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Join Organization</CardTitle>
            <CardDescription>Join your team's workspace with an invitation code</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="organizationCode">Organization Code</Label>
              <Input 
                id="organizationCode" 
                type="text" 
                placeholder="company-code" 
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
              {isLoading ? 'Joining...' : 'Join Organization'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Need to create a new organization?{" "}
              <Link href="/partner/signup" className="underline">Start here</Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/partner/login" className="underline">Sign in</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
  );
}
