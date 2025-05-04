// services/api/adminApiService.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { BASE_API_URL } from '@/config';

// Define response interfaces
export interface AdminResponse {
  success: boolean;
  message: string;
}

export interface ClearCacheResponse extends AdminResponse {
  // Any additional fields specific to cache clearing
}

export interface ClearTokensResponse extends AdminResponse {
  usersAffected?: number;
  firebaseSessionsRevoked?: number;
}

export interface BroadcastResponse extends AdminResponse {
  sentCount?: number;
  totalTokens?: number;
}

/**
 * Clear the application cache
 */
export const clearCache = async (): Promise<ClearCacheResponse> => {
  try {
    const response = await makeApiCall<ClearCacheResponse>(
      `${BASE_API_URL}/admin/clearcache`,
      'POST'
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      message: 'Failed to clear application cache'
    };
  }
};

/**
 * Clear all user push tokens and log everyone out
 */
export const clearAllPushTokens = async (): Promise<ClearTokensResponse> => {
  try {
    const response = await makeApiCall<ClearTokensResponse>(
      `${BASE_API_URL}/admin/clear-push-tokens`,
      'POST'
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error clearing push tokens:', error);
    return {
      success: false,
      message: 'Failed to clear push tokens and log users out'
    };
  }
};

/**
 * Send a system-wide broadcast notification to all users
 */
export const broadcastNotification = async (): Promise<BroadcastResponse> => {
  try {
    const response = await makeApiCall<BroadcastResponse>(
      `${BASE_API_URL}/admin/broadcast-notification`,
      'POST'
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return {
      success: false,
      message: 'Failed to broadcast notification'
    };
  }
};

/**
 * Send a test notification to a specific token
 */
export const sendTestNotificationToToken = async (token: string): Promise<AdminResponse> => {
  try {
    const response = await makeApiCall<AdminResponse>(
      `${BASE_API_URL}/notifications/test`,
      'POST',
      { token }
    );

    return response || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Error sending test notification to token:', error);
    return {
      success: false,
      message: 'Failed to send test notification to specific token'
    };
  }
};

// Export all functions as a service object
export const adminApiService = {
  clearCache,
  clearAllPushTokens,
  broadcastNotification,
  sendTestNotificationToToken
};