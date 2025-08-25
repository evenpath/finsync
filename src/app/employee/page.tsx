"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';

export default function EmployeePage() {
  const { user, loading } = useMultiWorkspaceAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect to chat as the default page
        router.push('/employee/chat');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your workspaces...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to chat...</p>
        </CardContent>
      </Card>
    </div>
  );
}