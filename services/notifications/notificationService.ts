// services/notifications/notificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { makeApiCall } from '@/services/auth/authRequest';
import { BASE_API_URL } from '@/config';

// Types
import { NotificationSettings } from './types';

export interface NotificationResponse {
  success: boolean;
  message: string;
}

export const isExpoToken = (token: string): boolean => {
  return !!token && (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['));
};

// Updated getProjectId function in notificationService.ts
const getProjectId = (): string => {
  // In development vs production handling
  const environment = Constants.expoConfig?.extra?.ENVIRONMENT || 'development';
  console.log(`App running in ${environment} environment`);

  // Get project ID from the most reliable sources
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.expoConfig?.extra?.EAS_PROJECT_ID ||
    '';

  if (projectId) {
    console.log(`Using EAS Project ID: ${projectId}`);
    return projectId;
  }

  // If we're in Expo Go, we can proceed without a project ID
  if (Constants.appOwnership === 'expo') {
    console.log('Running in Expo Go - project ID not required');
    return '';
  }

  console.warn('No project ID found. Push notifications may not work in production.');
  return '';
};
/**
 * Register for push notifications and return the token
 */
// services/notifications/notificationService.ts
// Updated registerForPushNotifications in notificationService.ts
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications not available in simulator');
    return null;
  }

  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return null;
    }
    console.log('Notification permissions granted');

    // Get the project ID
    const projectId = getProjectId();

    // Create token options
    const tokenOptions: Notifications.ExpoPushTokenOptions = {};
    if (projectId) {
      tokenOptions.projectId = projectId;
    }

    console.log('Getting push token with options:', tokenOptions);

    try {
      // Try to get an Expo push token first
      const tokenData = await Notifications.getExpoPushTokenAsync(tokenOptions);
      const token = tokenData.data;

      console.log('Successfully obtained push token:', token);
      console.log('Token type:', isExpoToken(token) ? 'Expo token' : 'FCM token');

      // Register with backend
      try {
        const result = await registerTokenWithBackend(token);
        console.log('Backend registration result:', result);
      } catch (error) {
        console.error('Failed to register token with backend:', error);
      }

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in registerForPushNotifications:', error);
    return null;
  }
};

/**
 * Register token with backend
 */
export const registerTokenWithBackend = async (token: string): Promise<NotificationResponse> => {
  try {

    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/push-token`,
      'POST',
      { pushToken: token }
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error registering push token with backend:', error);
    return {
      success: false,
      message: 'Failed to register push token'
    };
  }
};

/**
 * Remove token from backend
 */
export const removeTokenFromBackend = async (token: string): Promise<NotificationResponse> => {
  try {
    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/push-token`,
      'DELETE',
      { pushToken: token }
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error removing push token from backend:', error);
    return {
      success: false,
      message: 'Failed to remove push token'
    };
  }
};

/**
 * Toggle notifications
 */
export const toggleNotifications = async (enabled: boolean): Promise<NotificationResponse> => {
  try {
    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/notifications/toggle`,
      'PUT',
      { enabled }
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error toggling notifications:', error);
    return {
      success: false,
      message: 'Failed to toggle notifications'
    };
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings | null> => {
  try {
    const response = await makeApiCall<NotificationSettings>(
      `${BASE_API_URL}/users/notifications/settings`,
      'GET'
    );

    return response || null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<NotificationResponse> => {
  try {
    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/notifications/settings`,
      'PUT',
      settings
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return {
      success: false,
      message: 'Failed to update notification settings'
    };
  }
};

// Export all functions as a default object
export default {
  registerForPushNotifications,
  registerTokenWithBackend,
  removeTokenFromBackend,
  toggleNotifications,
  getNotificationSettings,
  updateNotificationSettings
};