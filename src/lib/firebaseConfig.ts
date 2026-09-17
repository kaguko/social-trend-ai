const getEnv = (key: string, fallback = ''): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && typeof metaEnv[key] === 'string') {
      return metaEnv[key];
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
      return process.env[key];
    }
  } catch {}

  return fallback;
};

const apiKey = getEnv('VITE_FIREBASE_API_KEY') || getEnv('FIREBASE_API_KEY') || '';
const projectId = getEnv('VITE_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID') || '';

export const firebaseConfig = {
  projectId: projectId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || getEnv('FIREBASE_APP_ID') || '',
  apiKey: apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || (projectId ? `${projectId}.firebaseapp.com` : ''),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || '',
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || '',
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || '',
  oAuthClientId: getEnv('VITE_FIREBASE_OAUTH_CLIENT_ID') || '',
  recaptchaSiteKey: ''
};

// Check whether Firebase has a valid, non-empty API key to prevent auth/invalid-api-key crashes
export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey.trim().length > 10 &&
  !apiKey.includes('YOUR_') &&
  projectId &&
  projectId.trim().length > 0
);

export default firebaseConfig;
