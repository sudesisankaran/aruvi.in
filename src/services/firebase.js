import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
    if (!file) return reject(new Error('No file provided for upload.'));

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const fullPath = `${folder}/${timestamp}_${cleanName}`;
    const storageRef = ref(storage, fullPath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.warn('Firebase storage direct error, fallback to data url:', error);
        // Fallback simulation
        const reader = new FileReader();
        reader.onload = (e) => {
          if (onProgress) onProgress(100);
          resolve({
            url: e.target.result,
            path: fullPath,
            name: file.name
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
            name: file.name
          });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}
