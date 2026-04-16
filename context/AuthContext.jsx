'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext({});

const appId = typeof __app_id !== 'undefined' ? __app_id : 'volthoist-africa';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const signUp = async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // --- NEW: Role Lookup Logic ---
            // Check if this email was pre-registered in the team collection by a Superuser
            let assignedRole = 'client'; // Default

            const teamRef = collection(db, 'artifacts', appId, 'public', 'data', 'team');
            const teamSnap = await getDocs(teamRef);

            // Find if this email exists in the invited team list
            const invitation = teamSnap.docs.find(doc => doc.data().email.toLowerCase() === email.toLowerCase());

            if (invitation) {
                assignedRole = invitation.data().role; // Grab 'engineer' or 'superuser'
            }

            const profileData = {
                uid,
                email,
                username: userData.username,
                companyName: userData.companyName || 'VoltHoist Team',
                companyReg: userData.companyReg || 'N/A',
                phoneNumber: userData.phoneNumber,
                country: userData.country,
                role: assignedRole, // Use the pre-assigned role or 'client'
                createdAt: new Date().toISOString()
            };

            const profileRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'data');
            await setDoc(profileRef, profileData);
            setProfile(profileData);
            return userCredential;
        } catch (error) {
            throw error;
        }
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        setProfile(null);
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
                try {
                    const profileSnap = await getDoc(profileRef);
                    if (profileSnap.exists()) {
                        setProfile(profileSnap.data());
                    }
                } catch (err) {
                    console.error("Profile Fetch Error:", err.message);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);