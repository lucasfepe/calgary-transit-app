// services/subscriptions/subscriptionService.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { Subscription, SubscriptionFormData, NotificationSettings } from '@/types/subscription';
import { TRIP_MAPPING_API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_ALERTS_KEY } from '@/constants';
import { ProximityAlert } from '../notifications/proximityAlertService';
import { Stop } from '@/types';

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
 * Delete a subscription and remove any associated proximity alert
 */
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    // Delete subscription from the API
    await makeApiCall<void>(`${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 'DELETE');
    
    // Also remove any proximity alert for this subscription
    const alertsJson = await AsyncStorage.getItem(ACTIVE_ALERTS_KEY);
    if (alertsJson) {
      const alerts = JSON.parse(alertsJson) as Record<string, ProximityAlert>;
      
      // Check if this subscription has an active alert
      if (alerts[id]) {
        // Remove this subscription from alerts
        delete alerts[id];
        
        // Save the updated alerts back to storage
        await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(alerts));
      }
    }
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};



/**
 * Get a subscription by ID (with caching)
 */
export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    // First check if we have this subscription in cache
    const SUBSCRIPTION_CACHE_KEY = 'SUBSCRIPTION_CACHE';
    const cachedSubscriptionsJson = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    const cachedSubscriptions = cachedSubscriptionsJson ? JSON.parse(cachedSubscriptionsJson) : {};
    
    // Check if this subscription exists in cache and is not too old
    if (cachedSubscriptions[id]) {
      const cachedData = cachedSubscriptions[id];
      const cacheAge = Date.now() - cachedData.timestamp;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      // If cache is fresh, return the cached data
      if (cacheAge < CACHE_TTL) {
        console.log(`Returning cached subscription data for ID: ${id}`);
        return cachedData.subscription;
      }
    }
    
    // Cache miss or stale cache, fetch from API
    console.log(`Fetching subscription data for ID: ${id} from API`);
    const response = await makeApiCall<Subscription>(`${TRIP_MAPPING_API_URL}/subscriptions/${id}`, 'GET');
    const response_stop = await makeApiCall<Stop>(`${TRIP_MAPPING_API_URL}/stop/${response?.stop_id}`, 'GET');
    
    if (response) {
      // Update cache with new data
      cachedSubscriptions[id] = {
        subscription: response,
        timestamp: Date.now()
      };
      
      // Store updated cache
      await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(cachedSubscriptions));
      
      return response;
    }
    
    return null;
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