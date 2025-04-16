import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stop } from '@/types/map';
import { RouteDataCache } from './types';
import { ROUTE_CACHE_KEY_PREFIX, ROUTE_CACHE_TIMESTAMP_KEY } from './constants';

/**
 * Loads all cached routes from AsyncStorage
 */
export const loadCachedRoutes = async (): Promise<RouteDataCache> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY_PREFIX));

        if (routeKeys.length === 0) return {};

        const routeEntries = await Promise.all(
            routeKeys.map(async (key) => {
                const data = await AsyncStorage.getItem(key);
                if (!data) return null;

                const routeId = key.replace(ROUTE_CACHE_KEY_PREFIX, '');
                return [routeId, JSON.parse(data)];
            })
        );

        // Filter out null entries and convert to object
        return Object.fromEntries(routeEntries.filter(Boolean) as [string, any][]);
    } catch (err) {
        console.error('Error loading cached routes:', err);
        return {};
    }
};

/**
 * Clears all cached routes from AsyncStorage
 */
export const clearAllCachedRoutes = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY_PREFIX));

        if (routeKeys.length > 0) {
            await AsyncStorage.multiRemove(routeKeys);
        }
    } catch (err) {
        console.error('Error clearing route cache:', err);
    }
};

/**
 * Saves a route to cache
 */
export const saveRouteToCache = async (
    routeId: string,
    shape: number[][][],
    stops: Stop[]
): Promise<void> => {
    try {
        const cacheData = {
            shape,
            stops,
            timestamp: Date.now()
        };

        await AsyncStorage.setItem(
            `${ROUTE_CACHE_KEY_PREFIX}${routeId}`,
            JSON.stringify(cacheData)
        );
    } catch (err) {
        console.error(`Error saving route ${routeId} to cache:`, err);
    }
};

/**
 * Updates the cache timestamp
 */
export const updateCacheTimestamp = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(
            ROUTE_CACHE_TIMESTAMP_KEY,
            Date.now().toString()
        );
    } catch (err) {
        console.error('Error updating cache timestamp:', err);
    }
};

/**
 * Gets the last cache reset timestamp
 */
export const getLastCacheReset = async (): Promise<Date> => {
    try {
        const timestampStr = await AsyncStorage.getItem(ROUTE_CACHE_TIMESTAMP_KEY);
        const timestamp = timestampStr ? parseInt(timestampStr, 10) : 0;
        return new Date(timestamp);
    } catch (err) {
        console.error('Error getting cache timestamp:', err);
        return new Date(0);
    }
};