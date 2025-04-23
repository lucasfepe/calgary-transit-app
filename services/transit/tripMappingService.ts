// services/transit/tripMappingService.ts
import {
  RouteData,
  RouteMapping,
  TripToRouteIndex,
  RouteDetailsResult,
  MappingResult
} from './tripMapping/types';
import {
  loadFromStorage,
  saveToStorage,
  clearAllCache,
  debugStorage
} from './tripMapping/storage';
import {
  isCacheValid,
  shouldResetCache,
  updateCacheTimestamp
} from './tripMapping/cacheManager';
import {
  fetchTripMappings,
  fetchRouteDetails
} from './tripMapping/api';

class TripMappingService {
  private cache: RouteMapping = {};
  private tripIndex: TripToRouteIndex = {};
  private lastUpdate: { [tripId: string]: number } = {};
  private routeDataLastUpdate: { [routeId: string]: number } = {};

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.loadFromStorage();
    await this.checkCacheExpiration();
  }

  private async loadFromStorage(): Promise<void> {
    const result = await loadFromStorage();
    console.log("loadFromStorage", Object.keys(result.lastUpdate).length);
    this.cache = result.cache;
    this.tripIndex = result.tripIndex;
    this.lastUpdate = result.lastUpdate;
    this.routeDataLastUpdate = result.routeDataLastUpdate;
  }

  private async checkCacheExpiration(): Promise<void> {
    try {
      if (await shouldResetCache()) {
        await this.clearRouteDataCache();
        await updateCacheTimestamp();
      }
    } catch (error) {
      console.error('Error checking cache expiration:', error);
    }
  }

  private isRouteDataCacheValid(routeId: string): boolean {
    return isCacheValid(this.routeDataLastUpdate[routeId]);
  }

  async updateMappings(tripIds: string[]): Promise<MappingResult> {
    console.log("updateMappings tripIds", tripIds.length);

    const uncachedTripIds = tripIds.filter(
      tripId => !isCacheValid(this.lastUpdate[tripId])
    );
    console.log("updateMappings uncachedTripIds", uncachedTripIds.length);
    if (uncachedTripIds.length === 0) return { success: true };
    // Call the lightweight endpoint
    const result = await fetchTripMappings(uncachedTripIds);

    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }
    const newMappings = result.data;
    console.log("updateMappings newMappings", JSON.stringify(result));
    Object.entries(newMappings).forEach(([routeId, routeData]) => {
      // Only store trip-to-route mappings (no shapes or stops)
      if (!this.cache[routeId]) {
        this.cache[routeId] = {
          tripIds: routeData.trip_ids,
          shape: [], // Will be loaded on demand
          stops: []  // Will be loaded on demand
        };
      } else {
        // Update trip IDs if the route already exists in cache
        this.cache[routeId].tripIds = [
          ...new Set([...this.cache[routeId].tripIds, ...routeData.trip_ids])
        ];
      }

      // Update trip-to-route index
      routeData.trip_ids?.forEach(transitId => {
        const transitIdStr = transitId.toString();
        this.tripIndex[transitIdStr] = routeId;
        this.lastUpdate[transitIdStr] = Date.now();
      });
    });
    // Save updated data to AsyncStorage
    await saveToStorage(this.cache, this.tripIndex, this.lastUpdate, this.routeDataLastUpdate);

    return { success: true };
  }

  async loadRouteDetails(routeId: string): Promise<RouteDetailsResult> {
    if (Object.keys(this.cache).length > 20) { // Limit to 20 routes
      // Remove oldest routes from cache
      const oldestRoutes = Object.entries(this.routeDataLastUpdate)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 5) // Remove 5 oldest
        .map(([id]) => id);

      oldestRoutes.forEach(id => {
        delete this.cache[id];
        delete this.routeDataLastUpdate[id];
      });

      console.log(`Removed ${oldestRoutes.length} old routes from cache`);
    }

    // Check if we already have the route data in memory
    if (this.cache[routeId] &&
      this.cache[routeId].shape &&
      this.cache[routeId].shape.length > 0 &&
      this.cache[routeId].stops &&
      this.cache[routeId].stops.length > 0 &&
      this.isRouteDataCacheValid(routeId)) {

      console.log(`Using cached route data for route ${routeId}`);
      return {
        success: true,
        data: {
          shape: this.cache[routeId].shape,
          stops: this.cache[routeId].stops
        }
      };
    }

    // Call the detailed endpoint
    console.log(`Fetching route data for route ${routeId}`);
    const result = await fetchRouteDetails(routeId);
    console.log("result.data?.stops[0]?.stop_name", result.data?.stops[0]?.stop_name);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    // Update cache with full route data
    if (this.cache[routeId]) {
      this.cache[routeId].shape = result.data.shape;
      this.cache[routeId].stops = result.data.stops;
      this.cache[routeId].routeLongName = result.data.route_long_name || undefined;
    } else {
      this.cache[routeId] = {
        tripIds: [],
        shape: result.data.shape,
        stops: result.data.stops,
        routeLongName: result.data.route_long_name || undefined
      };
    }

    // Update timestamp
    this.routeDataLastUpdate[routeId] = Date.now();

    // Save to storage
    await saveToStorage(this.cache, this.tripIndex, this.lastUpdate, this.routeDataLastUpdate);

    return {
      success: true,
      data: {
        shape: result.data.shape,
        stops: result.data.stops,
        route_long_name: result.data.route_long_name || undefined
      }
    };
  }

  getRouteForTrip(tripId: string): string | null {

    return this.tripIndex[tripId] || null;
  }

  getRouteData(routeId: string): RouteData | null {
    return this.cache[routeId] || null;
  }

  async clearCache(): Promise<void> {
    this.cache = {};
    this.tripIndex = {};
    this.lastUpdate = {};
    this.routeDataLastUpdate = {};

    await clearAllCache();
  }

  async clearRouteDataCache(): Promise<void> {
    // Clear route data but keep trip-to-route mappings
    for (const routeId in this.cache) {
      if (this.cache[routeId]) {
        this.cache[routeId].shape = [];
        this.cache[routeId].stops = [];
      }
    }
    this.routeDataLastUpdate = {};

    try {
      await saveToStorage(this.cache, this.tripIndex, this.lastUpdate, this.routeDataLastUpdate);
    } catch (error) {
      console.error('Error clearing route data cache:', error);
    }
  }

  async debugStorage(): Promise<void> {
    await debugStorage();
  }
}

export const tripMappingService = new TripMappingService();