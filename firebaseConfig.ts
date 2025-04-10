import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

type FirebaseConfig = {
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;
    FIREBASE_MEASUREMENT_ID: string;
};

const extra = Constants.expoConfig?.extra as FirebaseConfig | undefined;

if (!extra) {
    throw new Error('Firebase configuration is missing');
}

const firebaseConfig = {
    apiKey: extra.FIREBASE_API_KEY,
    authDomain: extra.FIREBASE_AUTH_DOMAIN,
    projectId: extra.FIREBASE_PROJECT_ID,
    storageBucket: extra.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.FIREBASE_APP_ID,
    measurementId: extra.FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase with config:', {
    ...firebaseConfig,
    apiKey: '**HIDDEN**' // Don't log the actual API key
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add an auth state listener to verify initialization
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User is signed in' : 'User is signed out');
});

export { auth };