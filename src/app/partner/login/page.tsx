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

// In a real app, this would use Firebase Auth with multi-tenancy
// For now, it's a placeholder.
export default function PartnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is where you would implement the tenant-aware login logic.
    // 1. Send email to a backend function to find the user's tenantId.
    // 2. Set `auth.tenantId = tenantId;` on the Firebase auth instance.
    // 3. Call `signInWithEmailAndPassword(auth, email, password);`
    
    console.log("Simulating Partner Login for:", email);

    setTimeout(() => {
      // For demonstration, we'll just redirect to the partner dashboard.
      toast({ title: "Login Successful", description: "Redirecting to your workspace..." });
      router.push('/partner');
      setIsLoading(false);
    }, 1500);
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
                placeholder="m@example.com" 
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
