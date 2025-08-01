// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // We'll use this later
import type { AuthState, FirebaseAuthUser } from '@/lib/types';

// For now, we'll create a mock auth state.
// In a real app, you would use onAuthStateChanged from Firebase.

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
        // Mocking authentication state.
        // In a real app, this would be replaced with Firebase's onAuthStateChanged listener.
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
             setUser(mockAdminUser);
        } else {
            // For other sections like partner or worker, you could set a different mock user
            // or leave it as null to force login. For now, we leave it null.
            setUser(null);
        }
       
        setLoading(false);

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
