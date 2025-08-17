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
import { Phone, KeyRound, Building2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
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
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    // Initialize reCAPTCHA
    initializeRecaptcha();
    
    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const initializeRecaptcha = () => {
    try {
      // Clear any existing verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      // Create new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log("reCAPTCHA solved:", response);
          setRecaptchaError(null);
        },
        'expired-callback': () => {
          console.log("reCAPTCHA expired");
          setRecaptchaError("reCAPTCHA expired. Please try again.");
        },
        'error-callback': (error: any) => {
          console.error("reCAPTCHA error:", error);
          setRecaptchaError("reCAPTCHA failed. Please refresh and try again.");
        }
      });

      console.log("reCAPTCHA verifier initialized");
    } catch (error: any) {
      console.error("Error initializing reCAPTCHA:", error);
      setRecaptchaError("Failed to initialize reCAPTCHA. Please refresh the page.");
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (!phone.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecaptchaError(null);

    try {
      // Clear any tenant ID for employee login
      auth.tenantId = null;

      // Format and validate phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      if (!validatePhoneNumber(formattedPhone)) {
        throw new Error("Please enter a valid phone number with country code (e.g., +1234567890)");
      }

      // Ensure reCAPTCHA is ready
      if (!window.recaptchaVerifier) {
        console.log("Reinitializing reCAPTCHA...");
        initializeRecaptcha();
        
        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page and try again.");
      }

      console.log("Attempting to send OTP to:", formattedPhone);
      
      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      setPhoneNumber(formattedPhone); // Update to formatted version
      
      toast({ 
        title: "OTP Sent! 📱", 
        description: "Please check your phone for the verification code." 
      });

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      
      let title = "Failed to Send OTP";
      let description = "Please try again.";
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/invalid-phone-number':
          description = "Invalid phone number. Please include the country code (e.g., +1234567890).";
          break;
        case 'auth/missing-phone-number':
          description = "Please enter a phone number.";
          break;
        case 'auth/quota-exceeded':
          description = "SMS quota exceeded. Please try again later.";
          break;
        case 'auth/too-many-requests':
          description = "Too many requests. Please wait a few minutes and try again.";
          break;
        case 'auth/internal-error':
          title = "Configuration Error";
          description = "Phone authentication is not properly configured. Please check:\n1. Phone provider is enabled in Firebase Console\n2. Your domain is authorized\n3. App Check is configured correctly";
          break;
        case 'auth/app-not-authorized':
          title = "App Not Authorized";
          description = "This app is not authorized to use Firebase Authentication. Please check your Firebase configuration.";
          break;
        case 'auth/captcha-check-failed':
          description = "reCAPTCHA verification failed. Please try again.";
          setRecaptchaError("reCAPTCHA failed. Reinitializing...");
          // Reinitialize reCAPTCHA
          setTimeout(() => {
            initializeRecaptcha();
          }, 1000);
          break;
        default:
          if (error.message.includes('reCAPTCHA')) {
            description = "reCAPTCHA verification failed. Please refresh the page and try again.";
            setRecaptchaError(error.message);
          } else {
            description = error.message || "An unexpected error occurred.";
          }
          break;
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 8000
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
        throw new Error("No confirmation result found. Please request a new OTP.");
      }

      if (otp.length !== 6) {
        throw new Error("Please enter the complete 6-digit verification code.");
      }
      
      console.log("Verifying OTP:", otp);
      await window.confirmationResult.confirm(otp);
      
      toast({ 
        title: "Login Successful! ✅", 
        description: "Redirecting to your dashboard..." 
      });
      
      // Redirect to employee dashboard
      router.push('/employee');

    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      
      let description = "Please check the code and try again.";
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          description = "Invalid verification code. Please check the 6-digit code from your SMS.";
          break;
        case 'auth/code-expired':
          description = "Verification code has expired. Please request a new one.";
          break;
        case 'auth/session-expired':
          description = "Session expired. Please start over by requesting a new OTP.";
          break;
        default:
          description = error.message || "Verification failed. Please try again.";
          break;
      }

      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: description
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setOtpSent(false);
    setOtp('');
    setRecaptchaError(null);
    
    // Reinitialize reCAPTCHA for fresh start
    setTimeout(() => {
      initializeRecaptcha();
    }, 500);
  };

  const handleRefreshRecaptcha = () => {
    setRecaptchaError(null);
    initializeRecaptcha();
    toast({
      title: "reCAPTCHA Refreshed",
      description: "Please try sending the OTP again."
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Employee Login</CardTitle>
            <CardDescription>
              {otpSent 
                ? "Enter the verification code sent to your phone"
                : "Sign in with your phone number to access your workspace"
              }
            </CardDescription>
          </CardHeader>

          {/* reCAPTCHA Error Alert */}
          {recaptchaError && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{recaptchaError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshRecaptcha}
                    className="mt-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh reCAPTCHA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include your country code (e.g., +1 for US/Canada)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading || !!recaptchaError}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/employee/join" className="text-primary hover:underline">
                    Join a workspace
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
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Sent to {phoneNumber}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleRetry} className="w-full" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Phone Number
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-sm">Having trouble?</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Make sure you have a stable internet connection</p>
                <p>• Check that your phone number includes the country code</p>
                <p>• SMS delivery may take up to 2 minutes</p>
                <p>• Contact your workspace admin if issues persist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* reCAPTCHA container - must be visible */}
      <div id="recaptcha-container"></div>
    </div>
  );
}