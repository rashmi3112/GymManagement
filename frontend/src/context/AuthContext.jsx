// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserProfile(snap.data());
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const register = async (email, password, name, role = 'member') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    // Create user doc in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      name,
      email,
      role,
      photoURL: null,
      phone: '',
      createdAt: serverTimestamp(),
    });

    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = doc(db, 'users', result.user.uid);
    const snap = await getDoc(userDoc);
    if (!snap.exists()) {
      await setDoc(userDoc, {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        role: 'member',
        photoURL: result.user.photoURL,
        phone: '',
        createdAt: serverTimestamp(),
      });
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isTrainer = userProfile?.role === 'trainer';
  const isMember = userProfile?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        fetchUserProfile,
        isAdmin,
        isTrainer,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
