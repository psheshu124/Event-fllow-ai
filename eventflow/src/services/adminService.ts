import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../types';

/**
 * Trusted Admin / Coordinator Service for Role Management
 * All operations are enforced both locally and by backend Firestore Security Rules.
 */
export async function promoteUserByEmail(
  targetEmail: string,
  newRole: UserRole = 'volunteer',
  currentAdminUid?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const trimmed = targetEmail.trim().toLowerCase();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', trimmed));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: `No user account found with email "${trimmed}".` };
    }

    const targetDoc = snap.docs[0];
    await updateDoc(targetDoc.ref, {
      role: newRole,
      promotedAt: new Date().toISOString(),
      promotedBy: currentAdminUid || 'admin',
    });

    return {
      success: true,
      message: `User "${trimmed}" successfully promoted to ${newRole}.`,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return {
      success: false,
      message: error.message || 'Failed to update user role in Firestore. Permission denied.',
    };
  }
}

/**
 * Promote user by their Firestore Document UID
 */
export async function promoteUserByUid(
  targetUid: string,
  newRole: UserRole = 'volunteer',
  currentAdminUid?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return { success: false, message: `User document "${targetUid}" does not exist in Firestore.` };
    }

    await updateDoc(userRef, {
      role: newRole,
      promotedAt: new Date().toISOString(),
      promotedBy: currentAdminUid || 'admin',
    });

    return {
      success: true,
      message: `User ${targetUid} successfully assigned role "${newRole}".`,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return {
      success: false,
      message: error.message || 'Permission denied: Cannot update user role.',
    };
  }
}
