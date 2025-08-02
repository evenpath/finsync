
// src/app/admin/diagnostics/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
}

export default function FirebaseDiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [
      { name: 'Environment Variables', status: 'checking', message: 'Checking...' },
      { name: 'Firebase Admin SDK', status: 'checking', message: 'Checking...' },
      { name: 'Multi-Tenancy Support', status: 'checking', message: 'Checking...' },
      { name: 'Tenant Creation Test', status: 'checking', message: 'Checking...' },
    ];

    setResults([...tests]);

    try {
      // Test 1: Environment Variables
      const envResponse = await fetch('/api/diagnostics/env');
      const envData = await envResponse.json();
      
      tests[0] = {
        name: 'Environment Variables',
        status: envData.success ? 'success' : 'error',
        message: envData.message,
        details: envData.details
      };
      setResults([...tests]);

      // Test 2: Firebase Admin SDK
      const adminResponse = await fetch('/api/diagnostics/admin-sdk');
      const adminData = await adminResponse.json();
      
      tests[1] = {
        name: 'Firebase Admin SDK',
        status: adminData.success ? 'success' : 'error',
        message: adminData.message,
        details: adminData.details
      };
      setResults([...tests]);

      // Test 3: Multi-Tenancy Support
      const tenancyResponse = await fetch('/api/diagnostics/multi-tenancy');
      const tenancyData = await tenancyResponse.json();
      
      tests[2] = {
        name: 'Multi-Tenancy Support',
        status: tenancyData.success ? 'success' : 'error',
        message: tenancyData.message,
        details: tenancyData.details
      };
      setResults([...tests]);

      // Test 4: Tenant Creation Test (only if previous tests pass)
      if (envData.success && adminData.success && tenancyData.success) {
        const createResponse = await fetch('/api/diagnostics/create-test-tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerName: 'Test-Diagnostic-Partner' })
        });
        const createData = await createResponse.json();
        
        tests[3] = {
          name: 'Tenant Creation Test',
          status: createData.success ? 'success' : 'error',
          message: createData.message,
          details: createData.details
        };
      } else {
        tests[3] = {
          name: 'Tenant Creation Test',
          status: 'warning',
          message: 'Skipped - Previous tests failed',
          details: 'Fix the issues above before testing tenant creation'
        };
      }

      setResults([...tests]);
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive', 
      warning: 'secondary',
      checking: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Firebase Diagnostics</h1>
        <p className="text-muted-foreground">
          Test your Firebase Admin SDK and Multi-Tenancy configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{result.name}</h3>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                        {result.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Enable Identity Platform:</strong></p>
            <p className="text-muted-foreground ml-4">
              Go to Google Cloud Console → Identity Platform → Enable Multi-tenancy
            </p>
            
            <p><strong>2. Service Account Permissions:</strong></p>
            <div className="text-muted-foreground ml-4 space-y-1">
              <p>• Firebase Admin SDK Administrator Service Agent</p>
              <p>• Service Usage Consumer</p>
              <p>• Identity Platform Admin</p>
              <p>• Firebase Authentication Admin</p>
            </div>
            
            <p><strong>3. Environment Variables:</strong></p>
            <div className="text-muted-foreground ml-4 space-y-1">
              <p>• FIREBASE_PRIVATE_KEY</p>
              <p>• FIREBASE_CLIENT_EMAIL</p>
              <p>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
