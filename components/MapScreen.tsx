// components/MapScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const MapScreen = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [vehicles, setVehicles] = useState<Array<{ id: string; latitude: number; longitude: number }>>([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            fetchRealTimeData();
        })();
    }, []);

    const fetchRealTimeData = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: 'https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream',
                responseType: 'arraybuffer',
            });

            const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));
            const vehicleData = feed.entity
                .filter(entity => entity.vehicle && entity.vehicle.vehicle && entity.vehicle.position)
                .map(entity => {
                    const id = entity.vehicle!.vehicle!.id;
                    const latitude = entity.vehicle!.position!.latitude;
                    const longitude = entity.vehicle!.position!.longitude;

                    // Ensure id is a string
                    return {
                        id: id || 'unknown', // Provide a default value if id is null or undefined
                        latitude,
                        longitude,
                    };
                });
            setVehicles(vehicleData);
        } catch (error) {
            console.error('Error fetching GTFS Realtime data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.coords.latitude : 51.0447,
                    longitude: location ? location.coords.longitude : -114.0719,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="You are here"
                        pinColor="blue"
                    />
                )}
                {vehicles.map(vehicle => (
                    <Marker
                        key={vehicle.id}
                        coordinate={{
                            latitude: vehicle.latitude,
                            longitude: vehicle.longitude,
                        }}
                        title={`Vehicle ID: ${vehicle.id}`}
                        pinColor="red"
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default MapScreen;