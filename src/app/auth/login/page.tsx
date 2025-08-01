// src/app/auth/login/page.tsx
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is a mock login flow that will be replaced with real Firebase Auth.
    // We check for a specific email to simulate admin login.
    if (email.toLowerCase() === 'core@suupe.com') {
      console.log("Simulating admin login...");
      try {
        // In a real scenario, you would use signInWithEmailAndPassword from Firebase.
        // For now, we simulate success and set a session flag.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        sessionStorage.setItem('isMockAuthenticated', 'true');
        sessionStorage.setItem('mockUserRole', 'admin'); // this will be used by useAuth
        
        toast({ title: "Login Successful", description: "Redirecting to admin dashboard..." });
        
        // Force a full page reload to ensure the AuthProvider picks up the new state
        window.location.href = '/admin';

      } catch (error) {
        console.error("Mock Login Error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "An unexpected error occurred.",
        });
        setIsLoading(false);
      }
    } else {
       toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please use the designated admin credentials.",
        });
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Login to Flow Factory</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="core@suupe.com" 
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
              placeholder="Enter any password"
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
  );
}
