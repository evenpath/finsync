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
import { createTenant } from '@/ai/flows/create-tenant-flow';
import { db } from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore"; 

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create a new Firebase Auth tenant for the new partner.
            const tenantResult = await createTenant({ partnerName: name });
            if (!tenantResult.success || !tenantResult.tenantId) {
                throw new Error(tenantResult.message || "Failed to create a new partner workspace.");
            }
            console.log("New tenant created:", tenantResult.tenantId);

            // 2. In a real app, you would create a new Partner document in Firestore
            //    with the `tenantId` from the previous step.
            //    Using the client SDK for this for simplicity, though this could be a server-action.
            await setDoc(doc(db, "partners", tenantResult.tenantId), {
                name: name,
                businessName: name,
                email: email,
                tenantId: tenantResult.tenantId,
                status: 'pending',
                plan: 'Starter',
                createdAt: new Date(),
            });
            console.log(`(Mock) Saving partner ${name} to Firestore with tenantId ${tenantResult.tenantId}`);

            // 3. Then, you would create the new user account *within* that tenant.
            //    This requires setting the tenantId on the auth instance on the client before `createUserWithEmailAndPassword`.
            //    For this simulation, we'll just log it.
            console.log(`(Mock) Creating user ${email} in tenant ${tenantResult.tenantId}`);
            
            toast({
                title: "Account Created!",
                description: "Redirecting you to the partner onboarding.",
            });
            // New partners are redirected to the onboarding flow
            router.push('/partner/onboarding');

        } catch (error: any) {
            console.error("Signup Error:", error);
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: error.message || "Could not create your account. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
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
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name" 
                placeholder="Your Company Name" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
              />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Your Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
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
              <Link href="/partner/login" className="underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
