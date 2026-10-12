import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  isVolunteer: boolean;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  promoteUserToVolunteer: (targetUid: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Pre-configured authorized organizers / volunteers to preserve during initial migration
const PRE_AUTHORIZED_VOLUNTEER_EMAILS = new Set([
  'volunteer@university.edu',
  'organizer@university.edu',
  'admin@eventflow.ai',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load and verify role strictly from Cloud Firestore
  const fetchUserRoleFromFirestore = async (currentUser: User): Promise<UserRole> => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const role: UserRole =
          data.role === 'volunteer' || data.role === 'admin' ? data.role : 'student';

        setUserProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: data.displayName || currentUser.displayName || '',
          role,
          createdAt: data.createdAt || new Date().toISOString(),
        });

        return role;
      } else {
        // Document does not exist yet (first-time migration or new account)
        // Check if user email is pre-authorized, or if existing local role was volunteer
        const emailLower = (currentUser.email || '').toLowerCase();
        const legacySavedRole = localStorage.getItem(`eventflow_user_role_${currentUser.uid}`);
        const isPreAuthorized =
          PRE_AUTHORIZED_VOLUNTEER_EMAILS.has(emailLower) || legacySavedRole === 'volunteer';

        const assignedRole: UserRole = isPreAuthorized ? 'volunteer' : 'student';

        const profileData: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          role: assignedRole,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, profileData);
        setUserProfile(profileData);
        return assignedRole;
      }
    } catch (err) {
      console.warn('[RBAC] Could not fetch Firestore user document. Defaulting to student.', err);
      // Safe fallback: NEVER elevate privileges on failure!
      return 'student';
    }
  };

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const verifiedRole = await fetchUserRoleFromFirestore(currentUser);
        setUserRole(verifiedRole);
      } else {
        setUserRole('student');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const role = await fetchUserRoleFromFirestore(userCredential.user);
      setUserRole(role);
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      setError(mapAuthErrorMessage(authErr.code, authErr.message));
      throw err;
    }
  };

  /**
   * Public Registration
   * Security Requirement: ALL newly registered users receive 'student' role by default.
   * Public users CANNOT specify or request volunteer or admin roles.
   */
  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      if (trimmedName) {
        await updateProfile(newUser, {
          displayName: trimmedName,
        });
      }

      // Check pre-authorized volunteer list for safe migration
      const isPreAuthorized = PRE_AUTHORIZED_VOLUNTEER_EMAILS.has(trimmedEmail);
      const assignedRole: UserRole = isPreAuthorized ? 'volunteer' : 'student';

      // Persist in Firestore
      const userRef = doc(db, 'users', newUser.uid);
      const profileData: UserProfile = {
        uid: newUser.uid,
        email: trimmedEmail,
        displayName: trimmedName,
        role: assignedRole,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, profileData);
      setUserProfile(profileData);
      setUserRole(assignedRole);
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      setError(mapAuthErrorMessage(authErr.code, authErr.message));
      throw err;
    }
  };

  /**
   * Trusted Admin / Coordinator promotion process
   * Promotes an existing student to volunteer in Firestore.
   */
  const promoteUserToVolunteer = async (targetUid: string) => {
    if (userRole !== 'volunteer' && userRole !== 'admin') {
      throw new Error('Unauthorized: Only authorized volunteers/admins can promote users.');
    }

    const targetUserRef = doc(db, 'users', targetUid);
    await updateDoc(targetUserRef, {
      role: 'volunteer',
      promotedAt: new Date().toISOString(),
      promotedBy: user?.uid || 'coordinator',
    });
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserRole('student');
      setUserProfile(null);
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      setError(mapAuthErrorMessage(authErr.code, authErr.message));
      throw err;
    }
  };

  const clearError = () => setError(null);

  const isVolunteer = userRole === 'volunteer' || userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isVolunteer,
        userProfile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        promoteUserToVolunteer,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function mapAuthErrorMessage(code?: string, defaultMsg?: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later.';
    default:
      return defaultMsg || 'An error occurred during authentication. Please try again.';
  }
}
