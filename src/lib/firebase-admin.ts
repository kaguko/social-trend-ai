import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { firebaseConfig } from './firebaseConfig';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

try {
  if (firebaseConfig.projectId && firebaseConfig.projectId.trim().length > 0) {
    adminApp = getApps().length ? getApps()[0] : initializeApp({
      projectId: firebaseConfig.projectId,
    });
    adminAuth = getAuth(adminApp);
  }
} catch (error) {
  console.warn('Firebase Admin initialization deferred:', error);
  adminAuth = null;
}

export { adminAuth };

