// services/transit/tripMappingService.ts

import axios from "axios";
import { TRIP_MAPPING_API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stop } from "@/types/map";

interface RouteData {
  tripIds: number[];
  shape: number[][][];
  stops: Stop[];
}

interface RouteMapping {
  [routeId: string]: RouteData;
}
interface RouteDataBE {
  trip_ids: number[];
  shape: number[][][];
  stops: Stop[];
}



interface RouteMappingBE {
  [routeId: string]: RouteDataBE;
}

interface TripToRouteIndex {
  [tripId: string]: string;
}

interface ErrorResponse {
  message: string;
}

class TripMappingService {
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static CACHE_KEY_PREFIX = 'route_mapping_cache_';
  private static INDEX_KEY = 'trip_index_cache';
  private static TIMESTAMP_KEY = 'last_update_cache';
  private static CHUNK_SIZE = 50; 

  private cache: RouteMapping = {};
  private tripIndex: TripToRouteIndex = {};
  private lastUpdate: { [tripId: string]: number } = {};

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Load index and timestamps
      const [cachedIndex, cachedTimestamps] = await Promise.all([
        AsyncStorage.getItem(TripMappingService.INDEX_KEY),
        AsyncStorage.getItem(TripMappingService.TIMESTAMP_KEY)
      ]);

      if (cachedIndex) {
        this.tripIndex = JSON.parse(cachedIndex);
      }
      if (cachedTimestamps) {
        this.lastUpdate = JSON.parse(cachedTimestamps);
      }

      // Load cache chunks
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(TripMappingService.CACHE_KEY_PREFIX)
      );

      const chunks = await Promise.all(
        cacheKeys.map(async key => {
          const data = await AsyncStorage.getItem(key);
          return data ? JSON.parse(data) : {};
        })
      );

      // Combine chunks
      this.cache = chunks.reduce((acc, chunk) => ({
        ...acc,
        ...chunk
      }), {});

    } catch (error) {
      console.error('Error loading from AsyncStorage:', error);
      // Reset to empty states if there's an error
      this.cache = {};
      this.tripIndex = {};
      this.lastUpdate = {};
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      // Save index and timestamps normally
      await AsyncStorage.setItem(TripMappingService.INDEX_KEY, JSON.stringify(this.tripIndex));
      await AsyncStorage.setItem(TripMappingService.TIMESTAMP_KEY, JSON.stringify(this.lastUpdate));

      // Chunk the cache data
      const routeIds = Object.keys(this.cache);
      const chunks: { [key: string]: RouteMapping } = {};
      
      for (let i = 0; i < routeIds.length; i += TripMappingService.CHUNK_SIZE) {
        const chunkRouteIds = routeIds.slice(i, i + TripMappingService.CHUNK_SIZE);
        const chunkData = chunkRouteIds.reduce((acc, routeId) => {
          acc[routeId] = this.cache[routeId];
          return acc;
        }, {} as RouteMapping);
        
        const chunkKey = `${TripMappingService.CACHE_KEY_PREFIX}${Math.floor(i / TripMappingService.CHUNK_SIZE)}`;
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


  private isCacheValid(tripId: string): boolean {
    const lastUpdateTime = this.lastUpdate[tripId];
    if (!lastUpdateTime) return false;
    return Date.now() - lastUpdateTime < TripMappingService.CACHE_DURATION;
  }

  async updateMappings(tripIds: string[]): Promise<{ success: boolean; error?: string }> {
    const uncachedTripIds = tripIds.filter(
      tripId => !this.isCacheValid(tripId)
    );

    if (uncachedTripIds.length === 0) return { success: true };

    try {
      const response = await axios.post(`${TRIP_MAPPING_API_URL}/tripmapping`, {
        tripIds: uncachedTripIds
      });

      const newMappings: RouteMappingBE = response.data;

      Object.entries(newMappings).forEach(([routeId, routeData]) => {
        // Update cache
        if (!this.cache[routeId]) {
          this.cache[routeId] = {
            tripIds: routeData.trip_ids,
            shape: routeData.shape,
            stops: routeData.stops
          };
        }

        // Update index and timestamps
        routeData.trip_ids?.forEach(transitId => {
          const transitIdStr = transitId.toString();
          this.tripIndex[transitIdStr] = routeId;
          this.lastUpdate[transitIdStr] = Date.now();
        });
      });
      console.log("tripIndex size:", Object.keys(this.tripIndex).length);

      // Save updated data to AsyncStorage
      await this.saveToStorage();

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = (error.response?.data as ErrorResponse)?.message || error.message;
        console.error('Error updating trip mappings:', errorMessage);
        return { 
          success: false, 
          error: errorMessage
        };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error updating mappings';
      console.error('Error updating trip mappings:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
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
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(TripMappingService.CACHE_KEY_PREFIX) ||
        key === TripMappingService.INDEX_KEY ||
        key === TripMappingService.TIMESTAMP_KEY
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }

  async debugStorage(): Promise<void> {
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
}

export const tripMappingService = new TripMappingService();