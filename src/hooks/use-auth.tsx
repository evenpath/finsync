// src/hooks/use-auth.tsx
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDocs, collection, query, where } from 'firebase/firestore';
import type { FirebaseAuthUser, AuthState, AdminUser } from '@/lib/types';
import { app } from '@/lib/firebase';
import { getDb } from '@/ai/genkit';

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
    const db = getDb();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    const idTokenResult = await firebaseUser.getIdTokenResult(true);
                    
                    let customClaims: { role?: 'Admin' | 'Super Admin' | 'partner' | 'employee', partnerId?: string | null } = {};

                    if (db) {
                        // Query the adminUsers collection to find the user by email
                        const adminUsersRef = collection(db, 'adminUsers');
                        const q = query(adminUsersRef, where("email", "==", firebaseUser.email));
                        const querySnapshot = await getDocs(q);
                        
                        if (!querySnapshot.empty) {
                            const adminUserData = querySnapshot.docs[0].data() as AdminUser;
                            customClaims.role = adminUserData.role;
                        } else if (firebaseUser.email === 'core@suupe.com') {
                            // Hardcoded fallback for the primary super admin
                            customClaims.role = 'Super Admin';
                        }
                    } else {
                        console.warn("Firestore not available for role lookup.");
                         if (firebaseUser.email === 'core@suupe.com') {
                            customClaims.role = 'Super Admin';
                        }
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
    }, [db]);

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
