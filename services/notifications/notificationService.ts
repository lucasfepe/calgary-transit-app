// services/notifications/notificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { makeApiCall } from '@/services/auth/authRequest';
import { BASE_API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
import { NotificationSettings } from './types';

export interface NotificationResponse {
  success: boolean;
  message: string;
}

export const isExpoToken = (token: string): boolean => {
  return !!token && (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['));
};

const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (!deviceId) {
      // Generate a new device ID if none exists
      deviceId = Device.deviceName + 
                 '-' + 
                 Platform.OS + 
                 '-' + 
                 Date.now().toString();
      await AsyncStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting/generating device ID:', error);
    // Fallback to a timestamp-based ID if AsyncStorage fails
    return `${Platform.OS}-${Date.now()}`;
  }
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

    // Get existing token from cache
    const cachedToken = await AsyncStorage.getItem('push_token');
    
    try {
      // Get a fresh token
      const tokenData = await Notifications.getExpoPushTokenAsync(tokenOptions);
      const newToken = tokenData.data;

      console.log('Successfully obtained push token:', newToken);
      console.log('Token type:', isExpoToken(newToken) ? 'Expo token' : 'FCM token');
      
      // Only register with backend if token is different from cached token
      if (newToken !== cachedToken) {
        console.log('Token changed or new, registering with backend');
        try {
          const result = await registerTokenWithBackend(newToken);
          console.log('Backend registration result:', result);
        } catch (error) {
          console.error('Failed to register token with backend:', error);
        }
      } else {
        console.log('Token unchanged, skipping backend registration');
      }

      return newToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      
      // Return cached token as fallback if available
      if (cachedToken) {
        console.log('Using cached token as fallback');
        return cachedToken;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error in registerForPushNotifications:', error);
    return null;
  }
};

export const cleanupPushTokenOnLogout = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('push_token');
    if (token) {
      // Remove token from backend
      await removeTokenFromBackend(token);
      // Clear token from local storage
      await AsyncStorage.removeItem('push_token');
      console.log('Push token cleaned up on logout');
    }
  } catch (error) {
    console.error('Error cleaning up push token:', error);
  }
};

/**
 * Register token with backend
 */
export const registerTokenWithBackend = async (token: string): Promise<NotificationResponse> => {
  try {
    // Get device information
    const deviceId = await getDeviceId();
    const deviceInfo = {
      deviceId,
      platform: Platform.OS,
      deviceName: Device.deviceName || 'Unknown Device',
      appVersion: Constants.expoConfig?.version || '1.0.0'
    };

    // Store the token locally (to avoid sending duplicates in the same session)
    await AsyncStorage.setItem('push_token', token);
    
    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/push-token`,
      'POST',
      { 
        pushToken: token,
        deviceInfo
      }
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
    // Get device ID if available
    const deviceId = await AsyncStorage.getItem('device_id');
    
    const response = await makeApiCall<NotificationResponse>(
      `${BASE_API_URL}/users/push-token`,
      'DELETE',
      { 
        pushToken: token,
        deviceId: deviceId || undefined 
      }
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
  updateNotificationSettings,
  cleanupPushTokenOnLogout
};