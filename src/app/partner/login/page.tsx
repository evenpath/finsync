// src/app/partner/login/page.tsx
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getTenantForEmailAction, validateTenantAction } from '@/actions/auth-actions';

const auth = getAuth(app);

export default function PartnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    auth.tenantId = null; // Reset tenant ID before starting

    try {
      // 1. Find the tenant ID for the user's email using the server action
      const tenantLookup = await getTenantForEmailAction(email);

      if (!tenantLookup.success || !tenantLookup.tenantId) {
        throw new Error(tenantLookup.message || "Your organization could not be found. Please contact support.");
      }
      
      console.log(`Found tenant ${tenantLookup.tenantId} for ${email}`);

      // 2. Validate the tenant exists in Firebase Auth before attempting sign-in
      const isValidTenant = await validateTenantAction(tenantLookup.tenantId);
      if (!isValidTenant) {
        throw new Error("Your organization's authentication is not properly configured. Please contact support.");
      }

      // 3. Set the tenant ID on the auth instance
      auth.tenantId = tenantLookup.tenantId;
      
      // 4. Sign in the user within their designated tenant
      await signInWithEmailAndPassword(auth, email, password);

      toast({ 
        title: "Login Successful", 
        description: "Redirecting to your workspace..." 
      });
      
      router.push('/partner');

    } catch (error: any) {
      console.error("Partner Login Error:", error);
      
      // Handle specific Firebase auth errors
      let errorMessage = "An error occurred during login.";
      
      if (error.code === 'auth/invalid-tenant-id') {
        errorMessage = "Your organization's authentication is not properly configured. Please contact support.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password for your organization.";
      } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      // Always reset tenantId after login attempt to prevent affecting other auth operations
      auth.tenantId = null;
    }
  };

  return (
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Partner Login</CardTitle>
            <CardDescription>Enter your work email to access your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Need to create an organization?{" "}
              <Link href="/auth/signup" className="underline">Sign up</Link>
            </div>
             <div className="text-center text-sm text-muted-foreground">
              Joining a team?{" "}
              <Link href="/partner/join" className="underline">Join here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
  );
}
