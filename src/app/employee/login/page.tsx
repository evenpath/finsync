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
import { Phone, KeyRound, Building2, Users, ArrowRight } from 'lucide-react';
import { handlePhoneAuthUser } from '@/services/phone-auth-service';
import type { WorkspaceAccess } from '@/lib/types';

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
  const [workspaces, setWorkspaces] = useState<WorkspaceAccess[]>([]);
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
      // Ensure no tenant ID is set for employee login
      auth.tenantId = null;

      // Format phone number if needed
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ 
        title: "OTP Sent", 
        description: "Please check your phone for the verification code." 
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: error.message || "Please check your phone number and try again.",
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
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const authResult = await handlePhoneAuthUser(formattedPhone, user.uid);
      
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

  const handleWorkspaceSelection = (workspace: WorkspaceAccess) => {
    toast({ 
      title: "Workspace Selected", 
      description: `Redirecting to ${workspace.partnerName}...` 
    });
    router.push('/employee');
  };

  const handleRetry = () => {
    setOtpSent(false);
    setOtp('');
    setShowWorkspaceSelection(false);
    setWorkspaces([]);
    window.confirmationResult = undefined;
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
              <div
                key={workspace.partnerId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => handleWorkspaceSelection(workspace)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                    {workspace.partnerName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{workspace.partnerName}</p>
                    <p className="text-sm text-muted-foreground capitalize">{workspace.role}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleRetry} className="w-full">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="w-6 h-6" />
            Employee Login
          </CardTitle>
          <CardDescription>
            {otpSent 
              ? "Enter the verification code sent to your phone"
              : "Enter your phone number to receive a verification code"
            }
          </CardDescription>
        </CardHeader>
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    placeholder="123456"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sent to {phoneNumber}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button type="button" variant="outline" onClick={handleRetry} className="w-full">
                Back to Phone Number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
      
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
