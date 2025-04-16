// services/transit/tripMapping/cacheManager.ts
import { getLastCacheResetTime, updateRouteDataTimestamp } from './storage';
import * as Constants from './constants';

export function isCacheValid(lastUpdateTime: number | undefined): boolean {
    if (!lastUpdateTime) return false;
    return Date.now() - lastUpdateTime < Constants.CACHE_DURATION;
}

export async function shouldResetCache(): Promise<boolean> {
    const lastResetDate = await getLastCacheResetTime();
    const now = new Date();

    // If it's a different day and it's past 3AM
    const isAfter3AM = now.getHours() >= 3;
    const isNewDay =
        lastResetDate.getDate() !== now.getDate() ||
        lastResetDate.getMonth() !== now.getMonth() ||
        lastResetDate.getFullYear() !== now.getFullYear();

    return isNewDay && isAfter3AM;
}

export async function updateCacheTimestamp(): Promise<void> {
    await updateRouteDataTimestamp();
}