
// src/app/admin/diagnostics/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
  fix?: string;
}

export default function FirebaseDiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [
      { name: 'Environment Variables', status: 'checking', message: 'Checking for required server credentials...' },
      { name: 'Firebase Admin SDK', status: 'checking', message: 'Attempting to initialize and connect...' },
      { name: 'Multi-Tenancy Support', status: 'checking', message: 'Verifying Identity Platform is enabled...' },
      { name: 'Tenant Creation Test', status: 'checking', message: 'Attempting to create and delete a test tenant...' },
    ];

    setResults([...tests]);

    try {
      // Test 1: Environment Variables
      const envResponse = await fetch('/api/diagnostics/env');
      const envData = await envResponse.json();
      if(envData.projectId) {
        setProjectId(envData.projectId);
      }
      if(envData.clientEmail) {
        setServiceAccountEmail(envData.clientEmail);
      }
      tests[0] = {
        name: 'Environment Variables',
        status: envData.success ? 'success' : 'error',
        message: envData.message,
        details: envData.details,
        fix: envData.fix
      };
      setResults([...tests]);

      // Test 2: Firebase Admin SDK
      const adminResponse = await fetch('/api/diagnostics/admin-sdk');
      const adminData = await adminResponse.json();
      tests[1] = {
        name: 'Firebase Admin SDK',
        status: adminData.success ? 'success' : 'error',
        message: adminData.message,
        details: adminData.details,
        fix: adminData.fix
      };
      setResults([...tests]);

      // Test 3: Multi-Tenancy Support
      const tenancyResponse = await fetch('/api/diagnostics/multi-tenancy');
      const tenancyData = await tenancyResponse.json();
      tests[2] = {
        name: 'Multi-Tenancy Support',
        status: tenancyData.success ? 'success' : 'error',
        message: tenancyData.message,
        details: tenancyData.details,
        fix: tenancyData.fix
      };
      setResults([...tests]);
      
      // Test 4: Tenant Creation Test (only if previous tests pass)
      if (envData.success && adminData.success && tenancyData.success) {
        const createResponse = await fetch('/api/diagnostics/create-test-tenant', {
          method: 'POST',
        });
        const createData = await createResponse.json();
        tests[3] = {
          name: 'Tenant Creation Test',
          status: createData.success ? 'success' : 'error',
          message: createData.message,
          details: createData.details,
          fix: createData.fix
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
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setResults(prev => [...prev, {
        name: 'Overall Test Runner',
        status: 'error',
        message: 'A client-side error occurred while running diagnostics.',
        details: errorMessage
      }]);
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Firebase Diagnostics</h1>
        <p className="text-muted-foreground">
          Test your Firebase Admin SDK and Multi-Tenancy configuration.
        </p>
      </div>

       <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-800">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
           <p>
            The most common cause of errors is missing IAM permissions for your service account. Please ensure the following roles are assigned to your service account in the Google Cloud Console.
          </p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-semibold">Your Service Account Email:</p>
            <p className="font-mono text-xs break-all">{serviceAccountEmail || 'Run diagnostics to find...'}</p>
          </div>
          
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to the <a href={`https://console.cloud.google.com/iam-admin/iam?project=${projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google Cloud IAM page <ExternalLink className="inline w-4 h-4"/></a> for your project.</li>
            <li>Find your service account, click the pencil icon to edit its roles.</li>
            <li>Add the following **5 roles**:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1 font-medium text-foreground">
                <li><code className="bg-muted px-1 py-0.5 rounded">Firebase Admin SDK Administrator Service Agent</code></li>
                <li><code className="bg-muted px-1 py-0.5 rounded">Service Usage Consumer</code></li>
                <li><code className="bg-muted px-1 py-0.5 rounded">Identity Platform Admin</code></li>
                <li><code className="bg-muted px-1 py-0.5 rounded">Firebase Authentication Admin</code></li>
                <li><code className="bg-muted px-1 py-0.5 rounded">Cloud Datastore User</code> (for Firestore)</li>
              </ul>
            </li>
             <li>Ensure Multi-Tenancy is enabled in <a href={`https://console.cloud.google.com/identity-platform/settings?project=${projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Identity Platform settings <ExternalLink className="inline w-4 h-4"/></a>.</li>
          </ol>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Configuration Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
            {isRunning ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Running Diagnostics...</>
            ) : 'Run Diagnostics'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(result.status)}</div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{result.name}</h3>
                      <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>{result.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    {result.details && <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">{result.details}</div>}
                    {result.fix && <div className="mt-2 p-2 bg-destructive/10 text-destructive/90 rounded text-xs "><span className="font-bold">Suggested Fix:</span> {result.fix}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
