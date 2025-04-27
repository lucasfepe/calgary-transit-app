// App.tsx - Simplified but with push notification support
import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/contexts/authContext';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text } from 'react-native';

// Configure notifications with error handling
try {
  // Configure how notifications appear when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log('Error configuring notification handler:', error);
  // Continue app execution even if notification configuration fails
}

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Safe notification setup
  useEffect(() => {
    let cleanupFunction = () => {};
    
    // Wrap in try-catch to prevent initialization failures
    try {
      // Register for push notifications - simplified
      const registerForPushNotifications = async () => {
        try {
          if (Platform.OS !== 'web') {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            // Only ask for permissions if not already granted
            if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
            }
            
            if (finalStatus === 'granted') {
              // Get push token
              const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: "132d4a2f-986f-4696-b4cc-97e811f719d0" // Your EAS project ID
              });
              console.log('Push token:', tokenData.data);
            }
          }
        } catch (error) {
          console.log('Error registering for push notifications (non-fatal):', error);
          // Continue app execution even if notifications fail
        }
      };
      
      // Call the registration function
      registerForPushNotifications();
      
      // Set up basic notification listeners
      try {
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received', notification);
        });
        
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response received', response);
        });
        
        // Update cleanup function
        cleanupFunction = () => {
          try {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
          } catch (error) {
            console.log('Error cleaning up notification listeners:', error);
          }
        };
      } catch (error) {
        console.log('Error setting up notification listeners:', error);
      }
    } catch (error) {
      console.log('Error in notification setup:', error);
    }
    
    return cleanupFunction;
  }, []);
  
  // Wrap the render in try-catch to prevent blank screen
  try {
    return (
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    );
  } catch (error) {
    console.log('Error rendering app:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Something went wrong. Please restart the app.</Text>
      </View>
    );
  }
}