import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { Vehicle } from './types';
import { determineVehicleType } from '../../utils/vehicleUtils';
import * as fs from 'fs/promises';

export const fetchTransitData = async (): Promise<Vehicle[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
            responseType: 'arraybuffer',
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

        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(response.data)
        );
        // const serviceAlertsFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(serviceAlerts.data)
        // );
        // const tripUpdatesFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(tripUpdates.data)
        // );
        await writeFeedToFile('feed.json', response.data);
        // await writeFeedToFile('serviceAlerts.json', serviceAlerts.data);
        // await writeFeedToFile('tripUpdates.json', tripUpdates.data);

        return feed.entity
            .filter(entity => entity.vehicle && entity.vehicle.vehicle && entity.vehicle.position)
            .map(entity => {
                const vehicle = entity.vehicle!;
                return {
                    id: vehicle.vehicle!.id || 'unknown',
                    latitude: vehicle.position!.latitude,
                    longitude: vehicle.position!.longitude,
                    routeId: vehicle.trip?.routeId || 'N/A',
                    label: vehicle.vehicle!.label || 'N/A',
                    speed: vehicle.position!.speed || 0,
                    vehicleType: determineVehicleType(vehicle)
                };
            });
    } catch (error) {
        console.error('Error fetching GTFS Realtime data:', error);
        throw error;
    }
};

export const transitService = {
    fetchRealTimeData: fetchTransitData
};


export async function writeFeedToFile(filePath: string, data: any): Promise<void> {
    try {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(data)
      );
      const feedJson = JSON.stringify(feed, null, 2);
      await fs.writeFile(filePath, feedJson);
      console.log(`Feed written to ${filePath}`);
    } catch (error) {
      console.error(`Error writing feed to ${filePath}:`, error);
    }
  }