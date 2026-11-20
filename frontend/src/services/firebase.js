import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAhRjW44QHFr4rwdEk0nvi2UlZNnQcLv_o",
  authDomain: "aruvicollections-5ce06.firebaseapp.com",
  projectId: "aruvicollections-5ce06",
  storageBucket: "aruvicollections-5ce06.firebasestorage.app",
  messagingSenderId: "1059586087475",
  appId: "1:1059586087475:web:2c9d321e7e0efbea5ee146",
  measurementId: "G-THM5GLJDCB"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Validates image format and file size
 */
export function validateImageFile(file, maxSizeMB = 10) {
  if (!file) {
    return { valid: false, error: 'Please choose an image file.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.`
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxSizeMB}MB.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Sign In with Google Provider
 */
export async function signInWithGoogleAuth() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    return {
      uid: u.uid,
      name: u.displayName || 'Google Patron',
      email: (u.email || '').toLowerCase().trim(),
      photoURL: u.photoURL || '',
      provider: 'google.com'
    };
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in window was closed.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      const host = window.location.hostname || 'current domain';
      throw new Error(`Firebase Google Auth domain unauthorized. Please add "${host}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    if (err.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('Google Sign-In requires HTTP/HTTPS server (not file://).');
    }
    throw err;
  }
}

/**
 * Firebase Sign Out
 */
export async function signOutAuth() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
}

/**
 * Upload File to Firebase Cloud Storage with progress callback
 */
export function uploadFileToFirebase(file, folder = 'products', onProgress) {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const fullPath = `${folder}/${timestamp}_${cleanName}`;
    const storageRef = ref(storage, fullPath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/webp'
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.warn('Firebase storage direct error, fallback to data url:', error);
        // Fallback simulation for offline testing
        const reader = new FileReader();
        reader.onload = (e) => {
          if (onProgress) onProgress(100);
          resolve({
            url: e.target.result,
            path: fullPath,
            name: file.name,
            size: file.size,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) onProgress(100);
          resolve({
            url: downloadURL,
            path: fullPath,
            name: file.name,
            size: file.size,
            type: file.type
          });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/**
 * Delete a file from Firebase Cloud Storage by its storage path
 */
export async function deleteFileFromFirebase(storagePath) {
  if (!storagePath) return false;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    return true;
  } catch (err) {
    console.warn(`Could not delete file ${storagePath} from Firebase Storage:`, err);
    return false;
  }
}

/**
 * Get current user token for authenticated backend API requests
 */
export async function getAuthToken() {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e);
    }
  }
  return null;
}
