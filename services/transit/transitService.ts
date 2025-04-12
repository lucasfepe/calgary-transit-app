// services/transit/transitService.ts
import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { Vehicle } from './types';
import { determineVehicleType } from '../../utils/vehicleUtils';

export class TransitService {
  async* streamTransitData(): AsyncGenerator<Vehicle> {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
        responseType: 'stream', // Important: get response as stream
      });
       // const serviceAlerts = await axios({
        //     method: 'get',
        //     url: 'https://data.calgary.ca/download/jhgn-ynqj/application%2Foctet-stream',
        //     responseType: 'arraybuffer',
        // });
        // const tripUpdates = await axios({
        //     method: 'get',
        //     url: 'https://data.calgary.ca/download/gs4m-mdc2/application%2Foctet-stream',
        //     responseType: 'arraybuffer',
        // });
        // const serviceAlertsFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(serviceAlerts.data)
        // );
        // const tripUpdatesFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(tripUpdates.data)
        // );
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of response.data) {
        chunks.push(chunk);
        
        // Try to process complete messages as they arrive
        try {
          const buffer = Buffer.concat(chunks);
          const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
          
          // Process each entity in the current chunk
          for (const entity of feed.entity) {
            if (entity.vehicle?.vehicle && entity.vehicle?.position) {
              const vehicle = entity.vehicle;
              yield {
                id: vehicle.vehicle!.id || 'unknown',
                latitude: vehicle.position!.latitude,
                longitude: vehicle.position!.longitude,
                routeId: vehicle.trip?.routeId || 'N/A',
                label: vehicle.vehicle!.label || 'N/A',
                speed: vehicle.position!.speed || 0,
                vehicleType: determineVehicleType(vehicle)
              };
            }
          }
          
          // Clear processed chunks
          chunks.length = 0;
        } catch (e) {
          // If we can't decode yet, continue collecting chunks
          continue;
        }
      }
    } catch (error) {
      console.error('Error streaming GTFS Realtime data:', error);
      throw error;
    }
  }
}

export const transitService = new TransitService();