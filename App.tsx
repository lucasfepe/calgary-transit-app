// Enhanced App.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { AuthProvider } from '@/contexts/authContext';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, AppState, AppRegistry } from 'react-native';
import { navigationRef } from './navigation/navigationRef'; // Create this file if you don't have it

// Configure notification handler outside of the component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Handle foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received in foreground:', notification);
        // You could show a custom alert here if you want
      }
    );

    // Handle notification responses (when user taps the notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;
        console.log('User tapped notification:', data);

        // Handle navigation based on notification data
        if (data.type === 'proximity_alert' && navigationRef.current) {
          // Navigate to a specific screen
          // For example:
          // navigationRef.current.navigate('Map', { 
          //   stopId: data.stopId,
          //   routeId: data.routeId,
          //   coordinates: {
          //     latitude: data.stop_lat,
          //     longitude: data.stop_lon
          //   }
          // });
        }
      }
    );

    // Handle app state changes (background/foreground transitions)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // You could refresh notification permissions or tokens here if needed
      }

      appState.current = nextAppState;
    });

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

AppRegistry.registerComponent('calgary-transit-app', () => App);