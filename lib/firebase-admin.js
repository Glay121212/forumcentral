import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let firestoreInstance = null;
let storageBucketInstance = null;
let isConfigured = false;

/**
 * Lazily initializes Firebase Admin SDK.
 * Will not throw during next build if environment variables are not set.
 */
export function getFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    return {
      isConfigured: false,
      db: null,
      bucket: null,
    };
  }

  // Handle escaped newlines in Vercel environment variables
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: storageBucket || `${projectId}.appspot.com`,
      });
      isConfigured = true;
    } catch (err) {
      console.error('[Firebase Admin] Initialization error:', err);
      return {
        isConfigured: false,
        db: null,
        bucket: null,
        error: err.message,
      };
    }
  } else {
    isConfigured = true;
  }

  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getApp());
  }

  if (!storageBucketInstance && (storageBucket || projectId)) {
    const bucketName = storageBucket || `${projectId}.appspot.com`;
    storageBucketInstance = getStorage(getApp()).bucket(bucketName);
  }

  return {
    isConfigured: true,
    db: firestoreInstance,
    bucket: storageBucketInstance,
  };
}
