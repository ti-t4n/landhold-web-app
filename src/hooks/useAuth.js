import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isEmailUser = firebaseUser.providerData.some(p => p.providerId === 'password');
        const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
        
        // Only require verification if it's a pure email user who hasn't verified yet
        if (isEmailUser && !firebaseUser.emailVerified && !isGoogleUser) {
          setNeedsVerification(true);
          setUser(firebaseUser);
        } else {
          setNeedsVerification(false);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setNeedsVerification(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return; // Prevents spam-clicking and popup collisions
    
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error("Google Sign-In Error:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Kept as an alias or secondary option if needed
  const loginWithGoogle = handleGoogleLogin;
  
  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const registerWithEmail = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred.user;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible'
      });
    }
    return window.recaptchaVerifier;
  };

  const loginWithPhone = async (phoneNumber, appVerifier) => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
      if (auth.currentUser.emailVerified) {
        setNeedsVerification(false);
      }
    }
  };

  const logout = () => signOut(auth);

  return {
    user,
    loading,
    needsVerification,
    isLoggingIn,
    loginWithGoogle,
    handleGoogleLogin,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    setupRecaptcha,
    loginWithPhone,
    refresh: refreshUser,
    logout
  };
}