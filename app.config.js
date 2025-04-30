// Load environment variables from .env file
require('dotenv').config();

export default {
    expo: {
        name: "RideAlerts - YYC",
        slug: "calgary-transit-app",
        entryPoint: "./index.js",
        updates: {
            enabled: false
        },
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/square_logo.png",
        userInterfaceStyle: "light",
        sdkVersion: "50.0.0",
        newArchEnabled: false,
        splash: {
            image: "./assets/square_logo.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        plugins: [
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "Allow Calgary Transit App to use your location for finding nearby transit stops."
                }
            ],
            [
                "expo-notifications",
                {
                    "icon": "./assets/drop_logo_notification.png",
                    "color": "#ffffff",
                    "androidMode": "default",
                    "androidCollapsedTitle": "RideAlerts - YYC"
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
                foregroundImage: "./assets/square_logo.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION",
                "RECEIVE_BOOT_COMPLETED",
                "POST_NOTIFICATIONS"
            ],
            package: "com.calgarytransitapp.app",
            googleServicesFile: "./google-services.json", // Add this line
            useNextNotificationsApi: true, // Add this line
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"
                }
            }
        },
        web: {
            favicon: "./assets/drop_logo_notification.png"
        },
        extra: {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
            FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
            EAS_PROJECT_ID: process.env.EAS_PROJECT_ID || '',
            PRODUCTION_BACKEND: process.env.PRODUCTION_BACKEND || '',
            ENVIRONMENT: process.env.ENVIRONMENT || "production",
            eas: {
                projectId: process.env.EAS_PROJECT_ID
            }
        }
    }
};