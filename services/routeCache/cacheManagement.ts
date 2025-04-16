import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheInfo, RouteDataCache } from './types';
import { ROUTE_CACHE_KEY_PREFIX, MAX_CACHE_SIZE_MB, ROUTE_CACHE_TIMESTAMP_KEY } from './constants';
import { clearAllCachedRoutes, updateCacheTimestamp } from './cacheStorage';

/**
 * Checks if cache should be reset (3AM rule)
 */
export const shouldResetCache = (lastReset: Date, now: Date): boolean => {
    // If it's a different day and it's past 3AM
    const isAfter3AM = now.getHours() >= 3;
    const isNewDay =
        lastReset.getDate() !== now.getDate() ||
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear();

    return isNewDay && isAfter3AM;
};

/**
 * Gets cache information for debugging
 */
export const getCacheInfo = async (): Promise<CacheInfo | null> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY_PREFIX));

        console.log(`Route cache contains ${routeKeys.length} routes`);

        // Calculate total size
        let totalSize = 0;
        for (const key of routeKeys) {
            const data = await AsyncStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        }

        console.log(`Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        return {
            routeCount: routeKeys.length,
            totalSizeBytes: totalSize,
            totalSizeMB: totalSize / 1024 / 1024
        };
    } catch (err) {
        console.error('Error getting cache info:', err);
        return null;
    }
};

/**
 * Manages cache size to prevent excessive storage usage
 */
export const manageCacheSize = async (
    routeCache: RouteDataCache,
    setRouteCache: (cache: RouteDataCache) => void
): Promise<void> => {
    try {
        const cacheInfo = await getCacheInfo();

        if (cacheInfo && cacheInfo.totalSizeMB > MAX_CACHE_SIZE_MB) {
            // If cache is too large, remove oldest entries
            const keys = await AsyncStorage.getAllKeys();
            const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY_PREFIX));

            // Get timestamps for all cached routes
            const routeTimestamps = await Promise.all(
                routeKeys.map(async (key) => {
                    const data = await AsyncStorage.getItem(key);
                    if (!data) return { key, timestamp: Date.now() };

                    const parsed = JSON.parse(data);
                    return { key, timestamp: parsed.timestamp || 0 };
                })
            );

            // Sort by timestamp (oldest first)
            routeTimestamps.sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest entries until we're under the limit
            // Start by removing 25% of the cache
            const keysToRemove = routeTimestamps
                .slice(0, Math.ceil(routeTimestamps.length * 0.25))
                .map(item => item.key);

            if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);

                // Update in-memory cache
                const newCache = { ...routeCache };
                keysToRemove.forEach(key => {
                    const routeId = key.replace(ROUTE_CACHE_KEY_PREFIX, '');
                    delete newCache[routeId];
                });

                setRouteCache(newCache);
                console.log(`Removed ${keysToRemove.length} routes from cache to manage size`);
            }
        }
    } catch (err) {
        console.error('Error managing cache size:', err);
    }
};

/**
 * Initializes the cache, handling the 3AM reset rule
 */
export const initializeCache = async (
    setRouteCache: (cache: RouteDataCache) => void
): Promise<RouteDataCache> => {
    try {
        // Get last reset timestamp
        const timestampStr = await AsyncStorage.getItem(ROUTE_CACHE_TIMESTAMP_KEY);
        const lastCacheReset = timestampStr ? parseInt(timestampStr, 10) : 0;

        const now = new Date();
        const lastResetDate = new Date(lastCacheReset);

        // Check if we should reset the cache
        if (shouldResetCache(lastResetDate, now)) {
            await clearAllCachedRoutes();
            await updateCacheTimestamp();
            return {};
        } else {
            // Load existing cache from storage
            const cache = await loadCachedRoutes();
            return cache;
        }
    } catch (err) {
        console.error('Failed to initialize route cache:', err);
        return {};
    }
};

// Re-export from cacheStorage for convenience
import { loadCachedRoutes } from './cacheStorage';