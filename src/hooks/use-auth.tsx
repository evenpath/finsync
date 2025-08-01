// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    const idTokenResult = await firebaseUser.getIdTokenResult(true);
                    
                    let customClaims: { role?: 'Admin' | 'Super Admin', partnerId?: string | null } = {};

                    // Query the adminUsers collection to find the user by email
                    const adminUsersRef = collection(db, 'adminUsers');
                    const q = query(adminUsersRef, where("email", "==", firebaseUser.email));
                    const querySnapshot = await getDoc(q as any); // Use getDocs for queries
                    
                    if (!querySnapshot.empty) {
                        const adminUserData = querySnapshot.docs[0].data() as AdminUser;
                        customClaims.role = adminUserData.role;
                    } else if (firebaseUser.email === 'core@suupe.com') {
                        // Hardcoded fallback for the primary super admin
                        customClaims.role = 'Super Admin';
                    } else {
                        // Handle partner users or employees if necessary in the future
                    }

                    const authUser: FirebaseAuthUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        phoneNumber: firebaseUser.phoneNumber,
                        emailVerified: firebaseUser.emailVerified,
                        customClaims: {
                            ...idTokenResult.claims,
                            ...customClaims,
                        },
                        creationTime: firebaseUser.metadata.creationTime || new Date().toISOString(),
                        lastSignInTime: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
                        providerData: firebaseUser.providerData
                    };
                    
                    setUser(authUser);
                } catch (e: any) {
                    console.error("Error processing user auth state:", e);
                    setError(e.message || "Failed to process user permissions.");
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
