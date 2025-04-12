import { FirebaseApp, initializeApp } from '@firebase/app';
import { 
    Auth, 
    getAuth, 
    initializeAuth, 
    browserLocalPersistence, 
    User 
} from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
    throw new Error('Firebase configuration is missing. Please check your app.config.js or app.json');
}

const requiredFields: (keyof FirebaseConfig)[] = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID'
];

for (const field of requiredFields) {
    if (!extra[field]) {
        throw new Error(`Missing required Firebase configuration field: ${field}`);
    }
}

const firebaseConfig = {
    apiKey: extra.FIREBASE_API_KEY,
    authDomain: extra.FIREBASE_AUTH_DOMAIN,
    projectId: extra.FIREBASE_PROJECT_ID,
    storageBucket: extra.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.FIREBASE_APP_ID,
    measurementId: extra.FIREBASE_MEASUREMENT_ID
} as const;

console.log('Firebase configuration fields:', Object.keys(firebaseConfig)
    .filter((key): key is keyof typeof firebaseConfig => !!firebaseConfig[key as keyof typeof firebaseConfig])
    .map(key => `${key}: [configured]`)
);

const app: FirebaseApp = initializeApp(firebaseConfig);

let auth: Auth;
try {
    if (Platform.OS === 'web') {
        auth = getAuth(app);
    } else {
        auth = initializeAuth(app, {
            persistence: browserLocalPersistence
        });
    }

    auth.onAuthStateChanged((user: User | null) => {
        if (__DEV__) {
            console.log('Auth state changed:', user ? 'User is signed in' : 'User is signed out');
        }
    });
} catch (error) {
    console.error('Error initializing Firebase Auth:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
}

export { auth };