import * as Location from 'expo-location';
import { LocationServiceConfig, LocationServiceError } from './types';

export const locationService = {
    defaultConfig: {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
    },

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            throw new Error('Failed to request location permissions');
        }
    },

    async getCurrentLocation(config?: Partial<LocationServiceConfig>) {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                throw new Error('Location permission not granted');
            }

            return await Location.getCurrentPositionAsync({
                ...this.defaultConfig,
                ...config,
            });
        } catch (error) {
            console.error('Error getting current location:', error);
            throw new Error('Failed to get current location');
        }
    },

    async watchLocation(
        callback: (location: Location.LocationObject) => void,
        config?: Partial<LocationServiceConfig>
    ) {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                throw new Error('Location permission not granted');
            }

            return await Location.watchPositionAsync(
                {
                    ...this.defaultConfig,
                    ...config,
                },
                callback
            );
        } catch (error) {
            console.error('Error watching location:', error);
            throw new Error('Failed to watch location');
        }
    }
};