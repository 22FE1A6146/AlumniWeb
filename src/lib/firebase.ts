import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,sendPasswordResetEmail as firebaseSendPasswordResetEmail, User } from "firebase/auth";
import { useEffect, useState } from "react";

// Firebase configuration from environment variables (Vite uses VITE_ prefix)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDUDTf3-qbFyM9EeDufNQsecCi_vFkHZ-k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alumniwebsite-581bf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alumniwebsite-581bf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alumniwebsite-581bf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "627272054843",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:627272054843:web:075ce5a1aec57220a1041e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Authentication functions with error handling
export const signUp = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
};







export const sendPasswordResetEmail = async (email: string) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || "Failed to send password reset email");
  }
};







export const logOut = async () => {
  try {
    return await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
};

// Custom hook to use authentication state
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { currentUser, loading };
}; 