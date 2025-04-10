import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { Vehicle } from './types';
import { determineVehicleType } from '../../utils/vehicleUtils';

export const fetchTransitData = async (): Promise<Vehicle[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
            responseType: 'arraybuffer',
        });

        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(response.data)
        );

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