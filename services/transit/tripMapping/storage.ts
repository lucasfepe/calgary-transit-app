// services/transit/tripMapping/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteMapping, TripToRouteIndex } from './types';
import * as Constants from './constants';

export async function loadFromStorage(): Promise<{
    cache: RouteMapping;
    tripIndex: TripToRouteIndex;
    lastUpdate: { [tripId: string]: number };
    routeDataLastUpdate: { [routeId: string]: number };
}> {
    try {
        // Load index and timestamps
        const [cachedIndex, cachedTimestamps, routeDataTimestamps] = await Promise.all([
            AsyncStorage.getItem(Constants.INDEX_KEY),
            AsyncStorage.getItem(Constants.TIMESTAMP_KEY),
            AsyncStorage.getItem(Constants.ROUTE_DATA_TIMESTAMP_KEY)
        ]);

        let tripIndex: TripToRouteIndex = {};
        let lastUpdate: { [tripId: string]: number } = {};
        let routeDataLastUpdate: { [routeId: string]: number } = {};

        if (cachedIndex) {
            tripIndex = JSON.parse(cachedIndex);
        }
        if (cachedTimestamps) {
            lastUpdate = JSON.parse(cachedTimestamps);
        }
        if (routeDataTimestamps) {
            routeDataLastUpdate = JSON.parse(routeDataTimestamps);
        }

        // Load cache chunks
        const allKeys = await AsyncStorage.getAllKeys();
        const cacheKeys = allKeys.filter(key =>
            key.startsWith(Constants.CACHE_KEY_PREFIX)
        );

        const chunks = await Promise.all(
            cacheKeys.map(async key => {
                const data = await AsyncStorage.getItem(key);
                return data ? JSON.parse(data) : {};
            })
        );

        // Combine chunks
        const cache = chunks.reduce((acc, chunk) => ({
            ...acc,
            ...chunk
        }), {});

        return { cache, tripIndex, lastUpdate, routeDataLastUpdate };
    } catch (error) {
        console.error('Error loading from AsyncStorage:', error);
        // Return empty states if there's an error
        return {
            cache: {},
            tripIndex: {},
            lastUpdate: {},
            routeDataLastUpdate: {}
        };
    }
}

export async function saveToStorage(
    cache: RouteMapping,
    tripIndex: TripToRouteIndex,
    lastUpdate: { [tripId: string]: number },
    routeDataLastUpdate: { [routeId: string]: number }
): Promise<void> {
    try {
        // Save index and timestamps normally
        await AsyncStorage.setItem(Constants.INDEX_KEY, JSON.stringify(tripIndex));
        await AsyncStorage.setItem(Constants.TIMESTAMP_KEY, JSON.stringify(lastUpdate));
        await AsyncStorage.setItem(Constants.ROUTE_DATA_TIMESTAMP_KEY, JSON.stringify(routeDataLastUpdate));

        // Chunk the cache data
        const routeIds = Object.keys(cache);
        const chunks: { [key: string]: RouteMapping } = {};

        for (let i = 0; i < routeIds.length; i += Constants.CHUNK_SIZE) {
            const chunkRouteIds = routeIds.slice(i, i + Constants.CHUNK_SIZE);
            const chunkData = chunkRouteIds.reduce((acc, routeId) => {
                acc[routeId] = cache[routeId];
                return acc;
            }, {} as RouteMapping);

            const chunkKey = `${Constants.CACHE_KEY_PREFIX}${Math.floor(i / Constants.CHUNK_SIZE)}`;
            chunks[chunkKey] = chunkData;
        }

        // Save chunks
        await Promise.all(
            Object.entries(chunks).map(([key, value]) =>
                AsyncStorage.setItem(key, JSON.stringify(value))
            )
        );
    } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
    }
}

export async function clearAllCache(): Promise<void> {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const cacheKeys = allKeys.filter(key =>
            key.startsWith(Constants.CACHE_KEY_PREFIX) ||
            key === Constants.INDEX_KEY ||
            key === Constants.TIMESTAMP_KEY ||
            key === Constants.ROUTE_DATA_TIMESTAMP_KEY
        );

        await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
    }
}

export async function updateRouteDataTimestamp(): Promise<void> {
    try {
        await AsyncStorage.setItem(
            Constants.ROUTE_DATA_TIMESTAMP_KEY,
            Date.now().toString()
        );
    } catch (error) {
        console.error('Error updating route data timestamp:', error);
    }
}

export async function getLastCacheResetTime(): Promise<Date> {
    try {
        const timestampStr = await AsyncStorage.getItem(Constants.ROUTE_DATA_TIMESTAMP_KEY);
        const lastCacheReset = timestampStr ? parseInt(timestampStr, 10) : 0;
        return new Date(lastCacheReset);
    } catch (error) {
        console.error('Error getting last cache reset time:', error);
        return new Date(0);
    }
}

export async function debugStorage(): Promise<void> {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        console.group('AsyncStorage Debug Info');

        for (const key of allKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                const size = new Blob([value]).size;
                console.log(`${key}: ${(size / 1024).toFixed(2)} KB`);
            }
        }

        console.groupEnd();
    } catch (error) {
        console.error('Debug error:', error);
    }
}