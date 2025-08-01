// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import type { FirebaseAuthUser, AuthState } from '@/lib/types';
import { app } from '@/lib/firebase';
import { mockAdminUsers } from '@/lib/mockData';

const auth = getAuth(app);

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseAuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idTokenResult = await firebaseUser.getIdTokenResult(true);
                    
                    // Find a matching mock user to get claims. This simulates the backend setting custom claims.
                    const mockUser = mockAdminUsers.find(u => u.email === firebaseUser.email);
                    
                    const customClaimsFromToken = (idTokenResult.claims || {}) as { 
                        role?: 'Super Admin' | 'Admin' | 'partner' | 'employee';
                        partnerId?: string;
                        permissions?: string[];
                    };

                    // Combine mock claims with token claims, giving precedence to mock claims for development.
                    const finalClaims = {
                      role: mockUser?.role || customClaimsFromToken.role || 'employee',
                      permissions: mockUser?.permissions || customClaimsFromToken.permissions || [],
                      partnerId: customClaimsFromToken.partnerId,
                    };
                    
                    const authUser: FirebaseAuthUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        phoneNumber: firebaseUser.phoneNumber,
                        emailVerified: firebaseUser.emailVerified,
                        customClaims: finalClaims,
                        creationTime: firebaseUser.metadata.creationTime || new Date().toISOString(),
                        lastSignInTime: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
                        providerData: firebaseUser.providerData
                    };
                    
                    setUser(authUser);
                } catch (e) {
                    console.error("Error processing user auth state:", e);
                    setError("Failed to process user permissions.");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthState = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
