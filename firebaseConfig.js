// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REMOVE THIS - not needed and causing the error
// import { getMessaging } from 'firebase/messaging';

const extra = Constants.expoConfig?.extra;

if (!extra) {
    throw new Error('Firebase configuration is missing. Please check your app.config.js or app.json');
}

const requiredFields = [
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
};

const app = initializeApp(firebaseConfig);

// REMOVE THIS ENTIRE BLOCK - not compatible with Expo 50 managed workflow
// let messaging;
// if (Platform.OS !== 'web') {
//     try {
//         messaging = getMessaging(app);
//         console.log('Firebase Cloud Messaging initialized successfully');
//     } catch (error) {
//         console.error('Error initializing Firebase Cloud Messaging:', error);
//     }
// }

// Initialize auth with appropriate persistence based on platform
let auth;
if (Platform.OS === 'web') {
    // For web, use the standard auth with browserLocalPersistence
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence)
        .catch(error => {
            console.error('Error setting persistence:', error);
        });
} else {
    // For mobile, use initializeAuth with AsyncStorage
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

// Set up auth state listener
onAuthStateChanged(auth, (user) => {
    if (__DEV__) {
        console.log('Auth state changed:', user ? 'User is signed in' : 'User is signed out');
    }
});

// Export only auth and app, not messaging
export { auth, app };