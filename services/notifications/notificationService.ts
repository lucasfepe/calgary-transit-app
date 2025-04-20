// services/notifications/notificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { makeApiCall } from '@/services/auth/authRequest';
import { TRIP_MAPPING_API_URL } from '@/config';

// Types
export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  minTimeBetweenNotifications: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
}

/**
 * Register for push notifications and return the token
 */
// services/notifications/notificationService.ts
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications are not available in the simulator');
    return null;
  }

  try {
    // Use the project ID you obtained from EAS init
    const projectId = process.env.EXPO_PROJECT_ID || '';
    
    // Check permissions with platform-specific handling
    if (Platform.OS === 'android') {
      // On Android, we'll try to get the token directly without explicitly requesting permissions
      // This is because the permission request is causing the error
      try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        
        // Register token with backend
        await registerTokenWithBackend(token);
        
        return token;
      } catch (tokenError) {
        console.error('Error getting push token on Android:', tokenError);
        return null;
      }
    } else {
      // iOS flow - check and request permissions explicitly
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token: permission not granted');
        return null;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      // Register token with backend
      await registerTokenWithBackend(token);
      
      return token;
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
      `${TRIP_MAPPING_API_URL}/users/push-token`, 
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
      `${TRIP_MAPPING_API_URL}/users/push-token`, 
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
      `${TRIP_MAPPING_API_URL}/users/notifications/toggle`, 
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
      `${TRIP_MAPPING_API_URL}/users/notifications/settings`, 
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
      `${TRIP_MAPPING_API_URL}/users/notifications/settings`, 
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