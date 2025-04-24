// services/notifications/proximityAlertService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter } from 'react-native';

const ACTIVE_ALERTS_KEY = 'active_proximity_alerts';

export interface ProximityAlert {
    subscriptionId: string;
    vehicleId: string;
    distance: number;
    estimatedArrival?: string;
    timestamp: number; // When the alert was received
}

/**
 * Store a new proximity alert when a notification is received
 */
export const addProximityAlert = async (
    subscriptionId: string,
    vehicleId: string,
    distance: number,
    estimatedArrival?: string
): Promise<void> => {
    try {
        // Get current alerts
        const currentAlerts = await getActiveProximityAlerts();
        const existingAlert = currentAlerts[subscriptionId];
        const isNew = !existingAlert;
        const hasChanged = existingAlert && (
            existingAlert.distance !== distance
        );

        if (isNew || hasChanged) {
            // Add or update alert for this subscription
            const updatedAlerts = {
                ...currentAlerts,
                [subscriptionId]: {
                    subscriptionId,
                    vehicleId,
                    distance,
                    estimatedArrival,
                    timestamp: Date.now()
                }
            };
            await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(updatedAlerts));

            // Emit event with the updated alerts
            DeviceEventEmitter.emit('proximityAlertsChanged', updatedAlerts);
        }

        // Save updated alerts
    } catch (error) {
        console.error('Error saving proximity alert:', error);
    }
};

/**
 * Get all active proximity alerts
 */
export const getActiveProximityAlerts = async (): Promise<Record<string, ProximityAlert>> => {
    try {
        const alertsJson = await AsyncStorage.getItem(ACTIVE_ALERTS_KEY);
        if (!alertsJson) return {};

        const alerts = JSON.parse(alertsJson) as Record<string, ProximityAlert>;

        // Filter out stale alerts (older than 10 minutes)
        const now = Date.now();
        const freshAlerts: Record<string, ProximityAlert> = {};

        Object.keys(alerts).forEach(key => {
            const alert = alerts[key];
            if (now - alert.timestamp < 10 * 60 * 1000) { // 10 minutes
                freshAlerts[key] = alert;
            }
        });

        // If we filtered out some alerts, save the updated list
        if (Object.keys(freshAlerts).length !== Object.keys(alerts).length) {
            await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(freshAlerts));
        }

        return freshAlerts;
    } catch (error) {
        console.error('Error getting proximity alerts:', error);
        return {};
    }
};

/**
 * Clear a specific proximity alert
 */
export const clearProximityAlert = async (subscriptionId: string): Promise<void> => {
    try {
        const alerts = await getActiveProximityAlerts();
        if (alerts[subscriptionId]) {
            delete alerts[subscriptionId];
            await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(alerts));
            DeviceEventEmitter.emit('proximityAlertsChanged', alerts);
        }
    } catch (error) {
        console.error('Error clearing proximity alert:', error);
    }
};

/**
 * Clear all proximity alerts
 */
export const clearAllProximityAlerts = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ACTIVE_ALERTS_KEY);
        DeviceEventEmitter.emit('proximityAlertsChanged', {});

    } catch (error) {
        console.error('Error clearing all proximity alerts:', error);
    }
};

/**
 * Handle proximity notifications
 */
export const handleProximityNotification = (notification: any) => {
    try {
        // console.log('Received proximity notification:', notification);
        // Extract data from notification
        const data = notification.request?.content?.data || notification.data;
        // Check if this is a proximity notification
        if (data && data.type === 'proximity_alert' && data.subscriptionId) {

            // Store the proximity alert
            addProximityAlert(
                data.subscriptionId,
                data.vehicleId || 'unknown',
                data.distance || 0,
                data.estimatedArrival
            );
        }
    } catch (error) {
        console.error('Error handling proximity notification:', error);
    }
};

/**
 * Set up notification listeners for proximity alerts
 */
export const setupProximityNotificationHandlers = () => {
    // Handle notifications received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
        handleProximityNotification(notification);
    });

    // Handle notification interaction when app is in background
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        handleProximityNotification(response.notification);
    });

    return () => {
        foregroundSubscription.remove();
        backgroundSubscription.remove();
    };
};

export default {
    getActiveProximityAlerts,
    clearProximityAlert,
    clearAllProximityAlerts,
    handleProximityNotification,
    setupProximityNotificationHandlers
};