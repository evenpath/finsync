// src/app/employee/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Phone, KeyRound, Building2, Users } from 'lucide-react';
import { handlePhoneAuthUser } from '@/services/phone-auth-service';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function EmployeeLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showWorkspaceSelection, setShowWorkspaceSelection] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          console.log("reCAPTCHA solved");
        }
      });
    }
    
    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      auth.tenantId = null;

      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!window.confirmationResult) {
        throw new Error("No confirmation result found. Please try sending the OTP again.");
      }
      
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;

      // Handle post-authentication workspace access
      const authResult = await handlePhoneAuthUser(phoneNumber, user.uid);
      
      if (!authResult.success) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: authResult.message,
        });
        return;
      }

      if (authResult.hasMultipleWorkspaces && authResult.workspaces) {
        setWorkspaces(authResult.workspaces);
        setShowWorkspaceSelection(true);
        toast({ 
          title: "Login Successful", 
          description: "Please select your workspace to continue." 
        });
      } else {
        toast({ 
          title: "Login Successful", 
          description: "Redirecting to your dashboard..." 
        });
        router.push('/employee');
      }

    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "The OTP is invalid or has expired. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceSelection = (workspace: any) => {
    toast({ 
      title: "Workspace Selected", 
      description: `Redirecting to ${workspace.partnerName}...` 
    });
    router.push('/employee');
  };

  if (showWorkspaceSelection) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Select Workspace
            </CardTitle>
            <CardDescription>
              You have access to multiple workspaces. Choose one to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspaces.map((workspace) => (
              <Button
                key={workspace.partnerId}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleWorkspaceSelection(workspace)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                    {workspace.partnerName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{workspace.partnerName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {workspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Employee Login</CardTitle>
              <CardDescription>Enter your phone number to receive a login code.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 555-123-4567" 
                      required 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Verify Code</CardTitle>
              <CardDescription>Enter the 6-digit code sent to your phone.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Verification Code</Label>
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="otp" 
                        type="text" 
                        maxLength={6}
                        placeholder="123456" 
                        required 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 tracking-widest text-center"
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
              <Button variant="link" size="sm" onClick={() => setOtpSent(false)}>
                Use a different phone number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}