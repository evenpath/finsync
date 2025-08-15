
// src/hooks/use-auth.ts
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { FirebaseAuthUser, AuthState } from '@/lib/types';

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          const claims = tokenResult.claims;
          
          setAuthState({
            user: {
              ...user,
              customClaims: claims
            } as FirebaseAuthUser,
            loading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error("Error fetching user token with claims:", error);
          setAuthState({ user, loading: false, error: "Failed to fetch user roles.", isAuthenticated: true });
        }
      } else {
        setAuthState({ user: null, loading: false, error: null, isAuthenticated: false });
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
