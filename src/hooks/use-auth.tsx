
// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { FirebaseAuthUser, AuthState } from '@/lib/types';

const mockAdminUser: FirebaseAuthUser = {
    uid: process.env.NEXT_PUBLIC_ADMIN_UID || 'admin-uid',
    email: 'admin@flowfactory.com',
    displayName: 'Admin User',
    photoURL: 'https://placehold.co/100x100.png',
    phoneNumber: null,
    emailVerified: true,
    customClaims: {
        role: 'admin',
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

    useEffect(() => {
        // Mocking authentication state using sessionStorage.
        // In a real app, this would be replaced with Firebase's onAuthStateChanged listener.
        const checkAuth = () => {
            try {
                const isAuthenticated = sessionStorage.getItem('isMockAuthenticated') === 'true';
                const role = sessionStorage.getItem('mockUserRole');

                if (isAuthenticated && role === 'admin') {
                    setUser(mockAdminUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // sessionStorage is not available on the server, so we can ignore this error.
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
        
        // Listen for changes in sessionStorage
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const value: AuthState = {
        user,
        loading,
        error: null, // No error handling in mock
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
