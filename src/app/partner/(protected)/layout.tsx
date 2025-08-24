"use client";

import { createContext, useContext } from 'react';
import PartnerSidebar from "../../../components/partner/PartnerSidebar";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";
import { AuthProvider } from '../../../hooks/use-auth';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import type { MultiWorkspaceAuthState } from '../../../lib/types';

// 1. Create the context with a default value (or null)
const MultiWorkspaceContext = createContext<MultiWorkspaceAuthState | null>(null);

// 2. Create a custom hook to consume the context
export function useMultiWorkspaceContext() {
  const context = useContext(MultiWorkspaceContext);
  if (!context) {
    throw new Error('useMultiWorkspaceContext must be used within a MultiWorkspaceProvider');
  }
  return context;
}

// 3. Create the provider component
function MultiWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const multiWorkspaceAuth = useMultiWorkspaceAuth();
  
  return (
    <MultiWorkspaceContext.Provider value={multiWorkspaceAuth}>
      {children}
    </MultiWorkspaceContext.Provider>
  );
}

// 4. Use the provider to wrap the layout
export default function ProtectedPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MultiWorkspaceProvider>
        <PartnerAuthWrapper>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <PartnerSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </PartnerAuthWrapper>
      </MultiWorkspaceProvider>
    </AuthProvider>
  );
}
