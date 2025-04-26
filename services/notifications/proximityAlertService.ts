// services/notifications/proximityAlertService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter } from 'react-native';
import { getSubscriptionById } from '@/services/subscriptions/subscriptionService';
import { Vehicle } from '@/types';
import { ACTIVE_ALERTS_KEY } from '@/constants';

const METERS_TO_MILES = 0.000621371;

export interface ProximityAlert {
    subscriptionId: string;
    vehicleId: string;
    distance: number;
    estimatedArrival?: string;
    timestamp: number; 
    minimumDistance: number;      
    previousDistance: number;     
    isApproaching: boolean;       
    stopPassed: boolean;
    stop_lat: number; 
    stop_lon: number; 
}

/**
 * Store a new proximity alert when a notification is received
 */

export const addProximityAlert = async (
    subscriptionId: string,
    vehicleId: string,
    distance: number,
    estimatedArrival?: string,
    stop_lat?: number,
    stop_lon?: number
): Promise<void> => {
    try {
        // Get current alerts
        const currentAlerts = await getActiveProximityAlerts();
        const existingAlert = currentAlerts[subscriptionId];
        const isNew = !existingAlert;
        const hasChanged = existingAlert && (
            existingAlert.distance !== distance
        );
        console.log("addProximityAlert", subscriptionId, vehicleId, distance, estimatedArrival, isNew, hasChanged);
        if (isNew || hasChanged) {
            // For a new alert, we always assume it's approaching
            // For existing alerts, we determine direction based on distance change
            const isApproaching = isNew ? true : distance < existingAlert.distance;
            
            // Keep track of the minimum distance observed so far
            const minimumDistance = isNew ? 
                distance : 
                Math.min(existingAlert.minimumDistance || Infinity, distance);
            
            // Check if the stop has been passed (for existing alerts only)
            // A stop is considered passed when:
            // 1. The vehicle got close (minimum distance < threshold)
            // 2. It's now moving away (not approaching)
            // 3. The distance has increased significantly from the minimum
            const STOP_PROXIMITY_THRESHOLD = 30;  // 30 meters
            const DISTANCE_INCREASE_THRESHOLD = 50;  // 50 meters
            
            let stopPassed = isNew ? false : existingAlert.stopPassed || false;
            
            if (!stopPassed && !isNew && !isApproaching) {
                // Only check for passing if we're not approaching and not already passed
                if ((minimumDistance < STOP_PROXIMITY_THRESHOLD) && 
                    ((distance - minimumDistance) > DISTANCE_INCREASE_THRESHOLD)) {
                    stopPassed = true;
                    console.log(`Vehicle ${vehicleId} has passed stop for subscription ${subscriptionId}`);
                }
            }

            // Add or update alert for this subscription
            const updatedAlerts = {
                ...currentAlerts,
                [subscriptionId]: {
                    subscriptionId,
                    vehicleId,
                    distance,
                    previousDistance: isNew ? distance : existingAlert.distance,
                    minimumDistance,
                    isApproaching,
                    stopPassed,
                    stop_lat: stop_lat || existingAlert?.stop_lat || 0,
                    stop_lon: stop_lon || existingAlert?.stop_lon || 0,
                    estimatedArrival,
                    timestamp: Date.now()
                }
            };
            
            await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(updatedAlerts));

            // Emit event with the updated alerts
        console.log("@2")

            DeviceEventEmitter.emit('proximityAlertsChanged', updatedAlerts);
            
            // If the stop has been passed, schedule clearing this alert after a delay
            if (stopPassed) {
                // Clear the alert after 2 minutes to allow UI to show the "passed" state
                setTimeout(() => {
                    clearProximityAlert(subscriptionId);
                }, 2 * 60 * 1000);
            }
        }
    } catch (error) {
        console.error('Error saving proximity alert:', error);
    }
};

/**
 * Update distances for all active alerts based on latest vehicle data
 */
export const updateProximityAlertDistances = async (vehicles: Vehicle[]): Promise<void> => {
  try {
    const activeAlerts = await getActiveProximityAlerts();
    // console.log("updateProximityAlertDistances", activeAlerts);
    
    // No active alerts, nothing to update
    if (Object.keys(activeAlerts).length === 0) return;
    
    // Create a set of vehicle IDs that we need to track
    const vehicleIdsToTrack = new Set(
      Object.values(activeAlerts).map(alert => alert.vehicleId)
    );
    
    // Filter vehicles to only those that are in active alerts
    const relevantVehicles = vehicles.filter(v => v.id && vehicleIdsToTrack.has(v.id));
    
    // If no relevant vehicles found, nothing to update
    if (relevantVehicles.length === 0) return;
    
    // Map of vehicle IDs to their current positions (only for vehicles we care about)
    const vehicleMap: Record<string, Vehicle> = {};
    relevantVehicles.forEach(v => {
      if (v.id) vehicleMap[v.id] = v;
    });
    
    let hasUpdates = false;
    
    // Check each alert to see if we have an updated position for its vehicle
    for (const subscriptionId of Object.keys(activeAlerts)) {
      const alert = activeAlerts[subscriptionId];
      const vehicle = vehicleMap[alert.vehicleId];
      // console.log("alert", alert);
      console.log("vehicle", vehicle);
      
      if (vehicle) {
        // Calculate new distance 
        const newDistance = await calculateDistance(vehicle, alert);
        console.log("newDistance", newDistance);
        const STOP_PROXIMITY_THRESHOLD = 300; // meters 
        const DISTANCE_INCREASE_THRESHOLD = 50; 
        const MOVING_AWAY_THRESHOLD = 100; 
        const GEOMETRY_FACTOR = 100; //SOME ROADS go away from destination to get to destination

        // Only update if distance has changed significantly 
        if (Math.abs(newDistance - alert.distance) > DISTANCE_INCREASE_THRESHOLD) {
          // Determine if vehicle is approaching or moving away
          const isApproaching = newDistance - GEOMETRY_FACTOR < alert.distance;
          
          // Update the minimum distance if this is closer than before
          const minimumDistance = Math.min(alert.minimumDistance || Infinity, newDistance);
          
          // Determine if vehicle has passed the stop
          // Logic: Vehicle was approaching, now it's moving away AND it got close enough to the stop
         
          // Check if the vehicle has passed the stop
          let stopPassed = alert.stopPassed;
          
          // Only check for stop passing if we haven't already detected it
          if (!stopPassed) {
            // If the vehicle got very close to the stop
            console.log("minimumDistance:", minimumDistance, "STOP_PROXIMITY_THRESHOLD:", STOP_PROXIMITY_THRESHOLD);
            if (minimumDistance < STOP_PROXIMITY_THRESHOLD) {
              // And now it's moving away significantly
              console.log("newDistance:", newDistance, "alert.distance:", alert.distance, "DISTANCE_INCREASE_THRESHOLD:", DISTANCE_INCREASE_THRESHOLD);
              if (!isApproaching && (newDistance - minimumDistance) > MOVING_AWAY_THRESHOLD) {
                stopPassed = true;
                console.log(`Vehicle ${vehicle.id} has passed stop for subscription ${subscriptionId}`);
              }
            }
          }
          
          // Update the alert
          activeAlerts[subscriptionId] = {
            ...alert,
            distance: newDistance,
            previousDistance: alert.distance,
            minimumDistance,
            isApproaching,
            stopPassed,
            timestamp: Date.now()
          };
          
          hasUpdates = true;
          
          // If the stop has been passed, schedule the alert to be cleared
          if (stopPassed) {
            // Clear the alert after a short delay (e.g., 1 minute)
            // This gives the UI time to show "Vehicle passed" status
            setTimeout(() => {
              clearProximityAlert(subscriptionId);
            }, 60000); // 1 minute delay
          }
        }
      }
    }
    
    // If any alerts were updated, save changes and emit event
    if (hasUpdates) {
      await AsyncStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(activeAlerts));
      console.log("@1")
      DeviceEventEmitter.emit('proximityAlertsChanged', activeAlerts);
    }
  } catch (error) {
    console.error('Error updating proximity alert distances:', error);
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
        console.log("getActiveProximityAlerts", alerts);
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
        console.log("@3")

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
        console.log("@4")

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
        console.log("data", data);
        if (data && data.type === 'proximity_alert' && data.subscriptionId) {

            // Store the proximity alert
            addProximityAlert(
                data.subscriptionId,
                data.vehicleId || 'unknown',
                data.distance || 0,
                data.estimatedArrival,
                data.stop_lat,
                data.stop_lon
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

/**
 * Get the most accurate distance between a vehicle and its subscribed stop
 */
const calculateDistance = async (vehicle: Vehicle, alert: ProximityAlert): Promise<number> => {
  try {
    // Get subscription details to access stop location
    console.log("alert", alert);
    
    // If we have stop coordinates, calculate actual distance
    const stopLat = alert.stop_lat;
    const stopLon = alert.stop_lon;
    const vehicleLat = vehicle.latitude;
    const vehicleLon = vehicle.longitude;
    console.log("vehicleLat", vehicleLat, "vehicleLon", vehicleLon, "stopLat", stopLat, "stopLon", stopLon);
    
    // Haversine formula to calculate distance in meters
    const R = 6371000; // Earth radius in meters
    const dLat = (vehicleLat - stopLat) * Math.PI / 180;
    const dLon = (vehicleLon - stopLon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(stopLat * Math.PI / 180) * Math.cos(vehicleLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    
    return distance;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return alert.distance;
  }
};

export default {
    getActiveProximityAlerts,
    clearProximityAlert,
    clearAllProximityAlerts,
    handleProximityNotification,
    setupProximityNotificationHandlers
};