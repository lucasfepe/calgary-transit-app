// services/transit/transitService.ts - Fixed version with proper error typing
import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { determineVehicleType } from '../../utils/vehicleUtils';
import { Vehicle } from '@/types/vehicles';

interface ProgressData {
  loaded: number;
  total?: number;
  progress: number;
}

export class TransitService {
  onVehicleUpdate?: (vehicle: Vehicle) => void;
  onBatchComplete?: (vehicles: Vehicle[]) => void;
  onProgress?: (progress: ProgressData) => void;
  
  // Track consecutive failures
  private consecutiveFailures = 0;
  private maxConsecutiveFailures = 3;
  private lastSuccessfulFetch = 0;

  async fetchTransitDataInChunks(): Promise<void> {
    const vehicles: Vehicle[] = [];
    try {
      // Check if we've had too many consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        // If it's been less than 5 minutes since our last successful fetch, wait longer
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - this.lastSuccessfulFetch < fiveMinutes) {
          console.log("Too many consecutive failures, waiting before retry");
          throw new Error("Too many consecutive failures, waiting before retry");
        } else {
          // Reset counter after 5 minutes to try again
          this.consecutiveFailures = 0;
        }
      }

      let lastProgress = 0;
      const response = await axios({
        method: 'get',
        url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        onDownloadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || 0;
          
          // Calculate progress even without total
          const progress = total 
            ? Math.round((loaded * 100) / total)
            : Math.round(loaded / 1024); // Show progress in KB if total unknown

          // Only emit progress if it's changed significantly
          if (progress > lastProgress) {
            lastProgress = progress;
            this.onProgress?.({
              loaded,
              total: progressEvent.total,
              progress
            });
          }
        },
      });

      // Validate response data
      if (!response.data || response.data.byteLength === 0) {
        throw new Error("Received empty response data");
      }

      // Create a safe buffer from the response data
      const buffer = new Uint8Array(response.data);
      
      try {
        // Safely decode the feed
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
        
        if (!feed || !feed.entity || !Array.isArray(feed.entity)) {
          throw new Error("Invalid GTFS feed format");
        }

        const totalEntities = feed.entity.length;
        console.log(`Processing ${totalEntities} transit entities`);
        
        // Use a safer approach to process entities
        const chunkSize = 10;
        
        for (let i = 0; i < totalEntities; i += chunkSize) {
          // Make sure we don't go out of bounds
          const end = Math.min(i + chunkSize, totalEntities);
          const chunk = feed.entity.slice(i, end);
          
          // Process each entity in the chunk
          for (const entity of chunk) {
            try {
              if (entity.vehicle?.vehicle && entity.vehicle?.position) {
                const vehicle = entity.vehicle;
                const vehicleData: Vehicle = {
                  id: vehicle.vehicle!.id || 'unknown',
                  latitude: vehicle.position!.latitude,
                  longitude: vehicle.position!.longitude,
                  tripId: vehicle.trip?.tripId || 'N/A',
                  label: vehicle.vehicle!.label || 'N/A',
                  speed: vehicle.position!.speed || 0,
                  vehicleType: determineVehicleType(vehicle)
                };
                vehicles.push(vehicleData);
                this.onVehicleUpdate?.(vehicleData);
              }
            } catch (entityError) {
              // Properly type the error
              const errorMessage = entityError instanceof Error 
                ? entityError.message 
                : String(entityError);
              console.warn(`Error processing entity at index ${i}:`, errorMessage);
              // Continue with next entity
            }
          }
          
          // Small delay between chunks to avoid blocking the UI
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Reset failure counter and update last successful fetch time
        this.consecutiveFailures = 0;
        this.lastSuccessfulFetch = Date.now();
        
        // Notify that all vehicles have been processed
        this.onBatchComplete?.(vehicles);
        console.log(`Successfully processed ${vehicles.length} vehicles`);
        
      } catch (decodeError) {
        // Properly type the unknown error
        const errorMessage = decodeError instanceof Error 
          ? decodeError.message 
          : String(decodeError);
          
        console.error('Error decoding GTFS data:', errorMessage);
        this.consecutiveFailures++;
        throw new Error(`Failed to decode GTFS data: ${errorMessage}`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      
      // Properly type the unknown error
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      console.error('Error fetching GTFS Realtime data:', errorMessage);
      
      // If we have some vehicles, still return them
      if (vehicles.length > 0) {
        console.log(`Returning ${vehicles.length} vehicles despite error`);
        this.onBatchComplete?.(vehicles);
      } else {
        throw error;
      }
    }
  }
  
  // Add a method to reset the failure counter
  resetFailureCounter() {
    this.consecutiveFailures = 0;
  }
  
  // Add a method to check if the service is in a backoff state
  isInBackoffState(): boolean {
    return this.consecutiveFailures >= this.maxConsecutiveFailures;
  }
}

export const transitService = new TransitService();