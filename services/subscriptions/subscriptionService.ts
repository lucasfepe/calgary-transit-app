// services/subscriptions/subscriptionService.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { Subscription, SubscriptionFormData, NotificationSettings } from '@/types/subscription';
import { TRIP_MAPPING_API_URL } from '@/config';

/**
 * Fetch all subscriptions for the current user
 */
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await makeApiCall<Subscription[]>(`${TRIP_MAPPING_API_URL}/subscriptions`, 'GET');
    return response || []; // Return empty array if response is undefined
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

/**
 * Fetch subscriptions with route details for the current user
 */
export const getSubscriptionsWithRouteDetails = async (): Promise<Subscription[]> => {
  try {
    const response = await makeApiCall<Subscription[]>(`${TRIP_MAPPING_API_URL}/subscriptions/with-details`, 'GET');
    return response || []; // Return empty array if response is undefined
  } catch (error) {
    console.error('Error fetching subscriptions with route details:', error);
    throw error;
  }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (data: SubscriptionFormData): Promise<Subscription> => {
  try {
    // Add default notification settings if not provided
    if (!data.notificationSettings) {
      data.notificationSettings = {
        enabled: true,
        minTimeBetweenNotifications: 10,
        soundEnabled: true,
        vibrationEnabled: true
      };
    }
    
    // Set default notification distance if not provided
    if (!data.notificationDistance) {
      data.notificationDistance = 500; // 500 meters
    }
    
    const response = await makeApiCall<Subscription>(`${TRIP_MAPPING_API_URL}/subscriptions`, 'POST', data);
    if (!response) {
      throw new Error('Failed to create subscription: No response from server');
    }
    return response;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Update an existing subscription
 */
export const updateSubscription = async (id: string, data: Partial<SubscriptionFormData>): Promise<Subscription> => {
  try {
    const response = await makeApiCall<Subscription>(`${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 'PUT', data);
    if (!response) {
      throw new Error('Failed to update subscription: No response from server');
    }
    return response;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

/**
 * Delete a subscription
 */
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    await makeApiCall<void>(`${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 'DELETE');
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

/**
 * Update notification settings for a subscription
 */
export const updateSubscriptionNotificationSettings = async (
  id: string, 
  settings: Partial<NotificationSettings>,
  distance?: number
): Promise<Subscription> => {
  try {
    // First get the current subscription to merge with partial settings
    const currentSubscription = await getSubscriptionById(id);
    
    if (!currentSubscription) {
      throw new Error('Subscription not found');
    }
    
    // Merge the partial settings with existing settings
    const mergedSettings: NotificationSettings = {
      ...currentSubscription.notificationSettings,
      ...settings
    };
    
    const updateData: Partial<SubscriptionFormData> = {
      notificationSettings: mergedSettings
    };
    
    if (distance !== undefined) {
      updateData.notificationDistance = distance;
    }
    
    const response = await makeApiCall<Subscription>(
      `${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 
      'PUT', 
      updateData
    );
    
    if (!response) {
      throw new Error('Failed to update notification settings: No response from server');
    }
    
    return response;
  } catch (error) {
    console.error('Error updating subscription notification settings:', error);
    throw error;
  }
};

/**
 * Get a subscription by ID
 */
export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    const response = await makeApiCall<Subscription>(`${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 'GET');
    return response || null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

/**
 * Toggle active status for a subscription
 */
export const toggleSubscriptionActive = async (id: string, active: boolean): Promise<Subscription> => {
  try {
    const response = await makeApiCall<Subscription>(
      `${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 
      'PUT', 
      { active }
    );
    
    if (!response) {
      throw new Error('Failed to toggle subscription: No response from server');
    }
    
    return response;
  } catch (error) {
    console.error('Error toggling subscription active status:', error);
    throw error;
  }
};