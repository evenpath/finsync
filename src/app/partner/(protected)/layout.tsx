"use client";

import { createContext, useContext } from 'react';
import PartnerSidebar from "../../../components/partner/PartnerSidebar";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";
import { AuthProvider } from '../../../hooks/use-auth';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import type { MultiWorkspaceAuthState } from '../../../lib/types';

const MultiWorkspaceContext = createContext<MultiWorkspaceAuthState | null>(null);

function MultiWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const multiWorkspaceAuth = useMultiWorkspaceAuth();
  
  return (
    <MultiWorkspaceContext.Provider value={multiWorkspaceAuth}>
      {children}
    </MultiWorkspaceContext.Provider>
  );
}

export function useMultiWorkspaceContext() {
  const context = useContext(MultiWorkspaceContext);
  if (!context) {
    throw new Error('useMultiWorkspaceContext must be used within MultiWorkspaceProvider');
  }
  return context;
}

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