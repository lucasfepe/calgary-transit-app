// services/transitData.ts
import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export const fetchRealTimeVehicleLocations = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
            responseType: 'arraybuffer',
        });

        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));
        const vehicleData = feed.entity
            .filter(entity => entity.vehicle && entity.vehicle.vehicle && entity.vehicle.position)
            .map(entity => ({
                id: entity.vehicle!.vehicle!.id || 'unknown',
                latitude: entity.vehicle!.position!.latitude,
                longitude: entity.vehicle!.position!.longitude,
            }));

        return vehicleData;
    } catch (error) {
        console.error('Error fetching GTFS Realtime data:', error);
        throw error;
    }
};