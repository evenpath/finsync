// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { FirebaseAuthUser, AuthState, AdminUser } from '@/lib/types';
import { app, db } from '@/lib/firebase';

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
                    
                    // In a real app, custom claims are set on the backend.
                    // For this app, we will fetch the user's role from the 'adminUsers' collection in Firestore.
                    const userDocRef = doc(db, 'adminUsers', firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    let customClaims = { role: 'employee', partnerId: null };
                    
                    if (userDocSnap.exists()) {
                        const adminUserData = userDocSnap.data() as AdminUser;
                        customClaims.role = adminUserData.role;
                    } else {
                         // Fallback for mock users not in the DB, like 'core@suupe.com'
                         if (firebaseUser.email === 'core@suupe.com') {
                            customClaims.role = 'Super Admin';
                         }
                    }

                    const finalClaims = {
                      ...idTokenResult.claims,
                      ...customClaims
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
            // Only set loading to false after all async operations are complete.
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
