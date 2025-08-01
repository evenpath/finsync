
// src/components/admin/MigrationTools.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { migrateUserMappings, validateUserMappings } from '@/scripts/migrate-user-mappings';

export default function MigrationTools() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string>('');
  const [validationResult, setValidationResult] = useState<string>('');
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult('');
    
    try {
      const result = await migrateUserMappings();
      setMigrationResult(result.message);
      
      if (result.success) {
        toast({
          title: "Migration Complete",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Migration Failed",
          description: result.message,
        });
      }
    } catch (error: any) {
      const errorMessage = `Migration error: ${error.message}`;
      setMigrationResult(errorMessage);
      toast({
        variant: "destructive",
        title: "Migration Error",
        description: errorMessage,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleValidation = async () => {
    setIsValidating(true);
    setValidationResult('');
    
    try {
      const result = await validateUserMappings();
      setValidationResult(result.message);
      
      if (result.success) {
        toast({
          title: "Validation Complete",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Validation Failed",
          description: result.message,
        });
      }
    } catch (error: any) {
      const errorMessage = `Validation error: ${error.message}`;
      setValidationResult(errorMessage);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Multi-Tenant Migration Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">User Mapping Migration</h4>
              <p className="text-sm text-muted-foreground">
                Create user mappings for existing partners to enable proper tenant lookup during login.
              </p>
              <Button 
                onClick={handleMigration}
                disabled={isMigrating}
                className="w-full"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Run Migration
                  </>
                )}
              </Button>
              {migrationResult && (
                <div className={`p-3 rounded-md text-sm ${
                  migrationResult.includes('failed') || migrationResult.includes('error')
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {migrationResult.includes('failed') || migrationResult.includes('error') ? (
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  )}
                  {migrationResult}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Validate User Mappings</h4>
              <p className="text-sm text-muted-foreground">
                Check the current state of user mappings in the database.
              </p>
              <Button 
                onClick={handleValidation}
                disabled={isValidating}
                variant="outline"
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validate Mappings
                  </>
                )}
              </Button>
              {validationResult && (
                <div className={`p-3 rounded-md text-sm ${
                  validationResult.includes('failed') || validationResult.includes('error')
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {validationResult.includes('failed') || validationResult.includes('error') ? (
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  )}
                  {validationResult}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Migration Steps</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Run the migration to create user mappings for existing partners</li>
              <li>Validate that mappings were created successfully</li>
              <li>Test partner login functionality</li>
              <li>Monitor for any remaining authentication issues</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
