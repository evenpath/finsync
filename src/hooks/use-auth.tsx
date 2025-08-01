// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import type { FirebaseAuthUser, AuthState } from '@/lib/types';
import { app } from '@/lib/firebase'; // Import the initialized Firebase app

const auth = getAuth(app);

// Keep mock user for now to bridge the gap until backend functions are in place
const mockAdminUser: FirebaseAuthUser = {
    uid: process.env.NEXT_PUBLIC_ADMIN_UID || 'admin-uid',
    email: 'core@suupe.com',
    displayName: 'Super Admin',
    photoURL: 'https://placehold.co/100x100.png',
    phoneNumber: null,
    emailVerified: true,
    customClaims: {
        role: 'Super Admin',
    },
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
    providerData: [],
};

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
    const router = useRouter();

    useEffect(() => {
        // This is a temporary solution to bridge the gap between client-side auth state
        // and the full backend implementation. In a real scenario, the onAuthStateChanged
        // listener would be the single source of truth.
        const mockAuthCheck = () => {
            try {
                const isAuthenticated = sessionStorage.getItem('isMockAuthenticated') === 'true';
                if (isAuthenticated) {
                    setUser(mockAdminUser);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Session storage error", e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        mockAuthCheck();

        const handleStorageChange = () => {
            mockAuthCheck();
        };

        window.addEventListener('storage', handleStorageChange);

        // The onAuthStateChanged listener will be used for the real implementation
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // This part of the code is not fully active yet but is ready for the next step.
            // When we implement real Firebase login, this will take over.
            if (firebaseUser) {
                 // In a real app, you'd fetch custom claims here.
                 // For now, we continue to rely on the mock logic.
                 console.log("Firebase user detected:", firebaseUser.uid);
            } else {
                 console.log("No Firebase user.");
            }
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            unsubscribe(); // Cleanup the listener
        };
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
