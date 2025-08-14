// src/components/partner/TeamManagementDiagnostics.tsx
"use client";

import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, CheckCircle, User, Shield, Database } from 'lucide-react';

export default function TeamManagementDiagnostics() {
  const { user, loading, error, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading diagnostics...</div>;
  }

  const hasPartnerId = user?.customClaims?.partnerId;
  const hasRole = user?.customClaims?.role;
  const isPartnerRole = hasRole === 'partner_admin' || hasRole === 'employee';

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Team Management Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Authentication Status */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {isAuthenticated ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">Authentication Status</p>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </p>
            </div>
          </div>

          {/* User Information */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <User className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">User Information</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>UID:</strong> {user.uid}</p>
                    <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Custom Claims */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5" />
                  <p className="font-medium">Custom Claims</p>
                </div>
                
                {user.customClaims ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Role:</span>
                      <Badge variant={hasRole ? "default" : "destructive"}>
                        {hasRole || 'Not Set'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Partner ID:</span>
                      <Badge variant={hasPartnerId ? "default" : "destructive"}>
                        {hasPartnerId || 'Not Set'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tenant ID:</span>
                      <Badge variant={user.customClaims.tenantId ? "default" : "secondary"}>
                        {user.customClaims.tenantId || 'Not Set'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600 p-3 bg-red-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>No custom claims found</span>
                    </div>
                    <p className="mt-2 text-xs">
                      This is the root cause of the access error. Custom claims need to be set.
                    </p>
                  </div>
                )}
              </div>

              {/* Team Management Access Check */}
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Team Management Access</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Has Partner Role:</span>
                    <Badge variant={isPartnerRole ? "default" : "destructive"}>
                      {isPartnerRole ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Has Partner ID:</span>
                    <Badge variant={hasPartnerId ? "default" : "destructive"}>
                      {hasPartnerId ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Can Access Team Management:</span>
                    <Badge variant={(isPartnerRole && hasPartnerId) ? "default" : "destructive"}>
                      {(isPartnerRole && hasPartnerId) ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Raw Claims Data */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium mb-2">Raw Custom Claims Data</p>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(user.customClaims || {}, null, 2)}
                </pre>
              </div>

              {/* Error Information */}
              {error && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="font-medium text-red-800">Authentication Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
