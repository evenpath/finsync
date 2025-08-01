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
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the user's ID token to access custom claims
      const idTokenResult = await user.getIdTokenResult();
      const userRole = idTokenResult.claims.role;

      toast({ title: "Login Successful", description: "Redirecting..." });
      
      // Redirect based on role
      if (userRole === 'Super Admin' || userRole === 'Admin') {
        router.push('/admin');
      } else if (userRole === 'partner') {
        // Assuming partner admins and employees go to the partner dashboard first
        router.push('/partner');
      } else if (userRole === 'employee') {
        router.push('/employee');
      }
      else {
        router.push('/'); // Default redirect
      }

    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials or user not found.",
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
  );
}
