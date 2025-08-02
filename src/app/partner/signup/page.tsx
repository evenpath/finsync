
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
import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getTenantForEmailAction } from '@/actions/auth-actions';

export default function PartnerSignupPage() {
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
            // Step 1: Check if a user with this email already exists
            const existingUserCheck = await getTenantForEmailAction(email);
            if (existingUserCheck.success) {
                throw new Error("An account with this email already exists. Please log in.");
            }

            // Step 2: Create the tenant and partner document.
            // This flow is now simplified and does not create the user.
            const tenantResult = await createTenant({ 
                partnerName: name, 
                email: email,
            });

            if (!tenantResult.success || !tenantResult.tenantId || !tenantResult.partnerId) {
                throw new Error(tenantResult.message || "Failed to create a new partner workspace.");
            }
            
            console.log(`New tenant created: ${tenantResult.tenantId} for partner ${tenantResult.partnerId}`);
            
            // Step 3: Create the admin user for the new tenant.
            // This flow now reliably handles user creation, claims, and mapping.
            const userResult = await createUserInTenant({
                email: email,
                password: password,
                tenantId: tenantResult.tenantId,
                displayName: name,
                partnerId: tenantResult.partnerId,
                role: 'partner_admin',
            });

            if (!userResult.success) {
                // In a real app, you might want a rollback mechanism here for the created tenant.
                throw new Error(userResult.message || "Workspace created, but failed to set up admin user.");
            }
            
            toast({
                title: "Account Created!",
                description: "Your organization workspace has been set up. You can now sign in.",
            });

            router.push('/partner/login');

        } catch (error: any) {
            console.error("Signup Error:", error);
            
            let errorMessage = "Failed to create account. Please try again.";
            if (error.message) {
                errorMessage = error.message;
            }

            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <form onSubmit={handleSignup}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create Partner Account</CardTitle>
                    <CardDescription>Set up your organization&apos;s workspace</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input 
                            id="name" 
                            type="text" 
                            placeholder="Your Company Name" 
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
                        {isLoading ? 'Creating Account...' : 'Create Organization'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/partner/login" className="underline">Sign in</Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
