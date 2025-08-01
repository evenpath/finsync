// src/app/auth/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // This is where you would integrate Firebase Auth.
        console.log("Attempting to sign up with:", name, email, password);

        setTimeout(() => {
            toast({
                title: "Account Created!",
                description: "Redirecting you to the partner onboarding.",
            });
            // New partners are redirected to the onboarding flow
            router.push('/partner/onboarding');
        }, 1500);
    };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSignup}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your information to create an account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Your Name" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
              />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create account'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
