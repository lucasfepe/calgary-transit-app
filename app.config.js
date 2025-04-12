// Load environment variables from .env file
require('dotenv').config();

export default {
    expo: {
        name: "calgary-transit-app",
        slug: "calgary-transit-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        plugins: [
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "Allow Calgary Transit App to use your location for finding nearby transit stops."
                }
            ]
        ],
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "This app needs access to location to show nearby transit stops.",
                NSLocationAlwaysAndWhenInUseUsageDescription: "This app needs access to location to show nearby transit stops.",
                UIBackgroundModes: ["location", "fetch"]
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION"
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
            FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
        }
    }
};