// components/map/components/StopMarkers.tsx
import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, View, StyleSheet } from 'react-native';
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
          zIndex={2}
        >
          {/* Custom marker with just the sequence number */}
          <View style={styles.markerContainer}>
            <Text style={styles.markerText}>{stop.stop_sequence}</Text>
          </View>

          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>Stop #{stop.stop_sequence}</Text>
              <Text>ID: {stop.stop_id}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 100,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  }
});