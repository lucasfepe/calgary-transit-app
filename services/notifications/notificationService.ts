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

const getProjectId = (): string => {
  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  console.log(`App running in ${isExpoGo ? 'Expo Go' : 'Production'} environment`);

  if (isExpoGo) {
    // In Expo Go, a project ID is not required the same way
    console.log('Using default project ID for Expo Go');
    return '';
  }

  // For production builds, try different sources for the project ID

  // 1. First check environment variables exposed through Constants.expoConfig
  if (Constants.expoConfig?.extra?.EAS_PROJECT_ID) {
    const id = Constants.expoConfig.extra.EAS_PROJECT_ID;
    console.log(`Using EAS_PROJECT_ID from Constants.expoConfig.extra: ${id}`);
    return id;
  }

  // 2. Check if it's in the manifest.extra.eas section
  if (Constants.expoConfig?.extra?.eas?.projectId) {
    const id = Constants.expoConfig.extra.eas.projectId;
    console.log(`Using projectId from manifest extra.eas section: ${id}`);
    return id;
  }

  return '';
};
/**
 * Register for push notifications and return the token
 */
// services/notifications/notificationService.ts
export const registerForPushNotifications = async (): Promise<string | null> => {
  // Log device and environment information for debugging
  console.log('Device information:', {
    brand: Device.brand,
    isDevice: Device.isDevice,
    osName: Device.osName,
    osVersion: Device.osVersion,
    appOwnership: Constants.appOwnership,
    executionEnvironment: Constants.executionEnvironment
  });

  if (!Device.isDevice) {
    console.log('Push notifications are not available in the simulator');
    return null;
  }

  try {
    // Get the appropriate project ID for the current environment
    const projectId = getProjectId();
    console.log(`Using project ID: ${projectId || 'default (Expo Go)'}`);

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(`Current notification permission status: ${existingStatus}`);

    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`New notification permission status: ${status}`);
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions denied by user');
      return null;
    }

    // Get push token, handling different environments
    console.log('Getting Expo push token...');
    const isExpoGo = Constants.appOwnership === 'expo';

    // In Expo Go we don't need to provide a projectId
    // In production builds we MUST provide the projectId
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      // Only pass projectId for production builds
      ...(isExpoGo ? {} : { projectId }),
    });

    const token = tokenResponse.data;
    console.log(`Successfully retrieved token: ${token}`);

    // Register with backend - passing environment info
    const backendResult = await registerTokenWithBackend(token);
    console.log('Backend registration result:', backendResult);

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:');

    if (error instanceof Error) {
      console.error(`${error.name}: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(JSON.stringify(error, null, 2));
    }

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