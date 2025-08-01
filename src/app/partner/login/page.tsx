
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

const auth = getAuth(app);

// This is a placeholder function. In a real app, this would be a secure serverless
// function that looks up the tenant ID for a given user email.
async function getTenantIdForEmail(email: string): Promise<string | null> {
  console.log(`(Mock) Looking up tenant for email: ${email}`);
  // In a real application, you would query a 'users' or 'userMappings' collection
  // in Firestore to find the tenantId associated with this email.
  // e.g., const userDoc = await db.collection('userMappings').doc(email).get();
  // if (userDoc.exists) return userDoc.data().tenantId; else return null;

  // For demonstration, we'll use a hardcoded map.
  const emailToTenantMap: { [key: string]: string } = {
    'user@techcorp.com': 'tenant_techcorp_industries',
    'admin@techcorp.com': 'tenant_techcorp_industries',
    'sara@techcorp.com': 'tenant_techcorp_industries',
    'mike@techcorp.com': 'tenant_techcorp_industries',
    'user@sunnyvale.com': 'tenant_sunnyvale_properties',
    'sigiravi2@gmail.com': 'tenant_brew_and_bonbon_cafe', // Added for your partner
  };
  
  const lowercasedEmail = email.toLowerCase();
  const tenantId = emailToTenantMap[lowercasedEmail];

  if (tenantId) {
    console.log(`(Mock) Found tenant: ${tenantId}`);
    return tenantId;
  }
  
  console.log(`(Mock) No tenant found for email: ${email}`);
  // Fallback for any other email to allow login for demo purposes.
  return "tenant_fallback_demo_id"; 
}


export default function PartnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Find the tenant ID for the user's email.
      const tenantId = await getTenantIdForEmail(email);

      if (!tenantId) {
        throw new Error("Your organization could not be found. Please contact support.");
      }

      // 2. Set the tenant ID on the auth instance. This is crucial for multi-tenancy.
      auth.tenantId = tenantId;

      // 3. Sign in the user within their designated tenant.
      await signInWithEmailAndPassword(auth, email, password);

      toast({ title: "Login Successful", description: "Redirecting to your workspace..." });
      router.push('/partner');

    } catch (error: any) {
        console.error("Partner Login Error:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Invalid credentials or workspace configuration issue.",
        });
    } finally {
        setIsLoading(false);
         // Reset tenantId after login attempt to not affect other auth operations
        auth.tenantId = null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
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
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline">Sign up</Link>
            </div>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
}
