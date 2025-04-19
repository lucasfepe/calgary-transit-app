// services/subscriptions/subscriptionService.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
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