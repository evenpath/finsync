// src/app/(employee-auth)/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { app } from '../../../lib/firebase';
import { Phone, KeyRound, Building2, Users, ArrowRight } from 'lucide-react';
import { handlePhoneAuthAction } from '../../../actions/employee-phone-actions';
import type { WorkspaceAccess } from '../../../lib/types';
import Link from 'next/link';

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
      
      let title = "Failed to Send OTP";
      let description = error.message || "Please check your phone number and try again.";
      
      if (error.code === 'auth/missing-phone-number') {
        description = "Please enter a valid phone number.";
      } else if (error.code === 'auth/invalid-phone-number') {
        description = "The phone number is not valid. Please include the country code (e.g., +1).";
      } else if (error.code === 'auth/too-many-requests') {
        description = "You've tried to send too many OTPs. Please try again later.";
      } else if (error.code === 'auth/internal-error') {
        title = "Firebase Configuration Error";
        description = "Phone sign-in is not enabled for this project. Please go to your Firebase Console, select Authentication > Sign-in method, and enable the 'Phone' provider.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 9000
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
      
      await window.confirmationResult.confirm(otp);
      
      // If OTP is correct, login is successful. Redirect to the dashboard.
      // The dashboard layout will handle workspace checks.
      toast({ 
        title: "Login Successful", 
        description: "Redirecting to your dashboard..." 
      });
      router.push('/employee');

    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let title = "Login Failed";
      let description = "An unknown error occurred. Please try again.";

      if (error.code === 'auth/code-expired') {
        description = "The verification code has expired. Please send a new one.";
      } else if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/invalid-credential') {
        description = "The verification code is incorrect. Please check the code and try again.";
      }
      
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setOtpSent(false);
    setOtp('');
    setShowWorkspaceSelection(false);
    setWorkspaces([]);
    window.confirmationResult = undefined;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
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
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
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
