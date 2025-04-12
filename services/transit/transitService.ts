// services/transit/transitService.ts
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
  onProgress?: (progress: ProgressData) => void;

  async fetchTransitDataInChunks(): Promise<void> {
    try {
      let lastProgress = 0;
      const response = await axios({
        method: 'get',
        url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
        responseType: 'arraybuffer',
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

      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data)
      );

      const chunkSize = 10;
      let processedCount = 0;
      const totalEntities = feed.entity.length;

      for (let i = 0; i < feed.entity.length; i += chunkSize) {
        const chunk = feed.entity.slice(i, i + chunkSize);
        
        chunk.forEach(entity => {
          if (entity.vehicle?.vehicle && entity.vehicle?.position) {
            const vehicle = entity.vehicle;
            const vehicleData: Vehicle = {
              id: vehicle.vehicle!.id || 'unknown',
              latitude: vehicle.position!.latitude,
              longitude: vehicle.position!.longitude,
              routeId: vehicle.trip?.routeId || 'N/A',
              label: vehicle.vehicle!.label || 'N/A',
              speed: vehicle.position!.speed || 0,
              vehicleType: determineVehicleType(vehicle)
            };

            this.onVehicleUpdate?.(vehicleData);
          }
        });

        processedCount += chunk.length;
        
        // Report processing progress
        this.onProgress?.({
          loaded: processedCount,
          total: totalEntities,
          progress: Math.round((processedCount * 100) / totalEntities)
        });

        // Prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error('Error fetching GTFS Realtime data:', error);
      throw error;
    }
  }
}

export const transitService = new TransitService();