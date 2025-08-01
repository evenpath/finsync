
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Attempting to log in with:", email, password);

    // This is a mock login flow.
    setTimeout(() => {
      // For this mock, we only care about the admin login.
      if (email.toLowerCase().includes('admin')) {
        // Simulate a successful login by setting a value in sessionStorage.
        // The AuthProvider will read this value.
        sessionStorage.setItem('isMockAuthenticated', 'true');
        sessionStorage.setItem('mockUserRole', 'admin');
        
        toast({ title: "Login Successful", description: "Redirecting to admin dashboard..." });
        router.push('/admin');
        router.refresh(); // Force a refresh to re-evaluate the auth state in the layout
      } else {
        sessionStorage.removeItem('isMockAuthenticated');
        sessionStorage.removeItem('mockUserRole');
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "For this demo, please use an email containing 'admin'.",
        });
        setIsLoading(false);
      }
    }, 1000);
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
              placeholder="admin@example.com" 
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
