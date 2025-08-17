

"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useToast } from "../../../../hooks/use-toast";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../../../lib/firebase';
import { getTenantForEmailAction } from '../../../../actions/auth-actions';

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

    let tenantId: string | null = null;

    try {
      // 1. Find the tenant ID for the user's email
      const tenantLookup = await getTenantForEmailAction(email);
      
      if (!tenantLookup.success || !tenantLookup.tenantId) {
        throw new Error(tenantLookup.message || "Your organization could not be found.");
      }
      
      tenantId = tenantLookup.tenantId;

      // 2. Set the tenant ID on the global auth object for this specific sign-in
      auth.tenantId = tenantId;
      
      // 3. Sign in the user within their tenant
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({ title: "Login Successful", description: "Redirecting to your workspace..." });
      router.push('/partner');

    } catch (error: any) {
      console.error("Partner Login Error:", error);
      
      let errorMessage = "An unknown error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-tenant-id') {
          errorMessage = "Your organization could not be found. Please contact support or try signing up.";
      } else if (error.message) {
          errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
        // 4. IMPORTANT: Always reset the tenantId after the operation to not affect other auth calls.
        auth.tenantId = null; 
        setIsLoading(false);
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
                placeholder="you@yourcompany.com" 
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
              Don't have an account?{" "}
              <Link href="/partner/signup" className="underline">Create an organization</Link>.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
