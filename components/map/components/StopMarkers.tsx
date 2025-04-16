// components/map/components/StopMarkers.tsx
import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, View } from 'react-native';
import { Stop } from '@/types/map';


interface StopMarkersProps {
  stops: Stop[];
  routeId: string | undefined;
}

export const StopMarkers: React.FC<StopMarkersProps> = ({ stops, routeId }) => {
  return (
    <>
      {stops.map((stop) => (
        <Marker
          key={`${routeId}-stop-${stop.stop_id}`}
          coordinate={{
            latitude: stop.stop_lat,
            longitude: stop.stop_lon,
          }}
          pinColor="#FF0000"
          zIndex={2}
        >
          <Callout>
            <View style={{ padding: 5 }}>
              <Text>Stop #{stop.stop_sequence}</Text>
              <Text>ID: {stop.stop_id}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  );
};