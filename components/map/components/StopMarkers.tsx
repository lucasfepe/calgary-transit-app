// components/map/components/StopMarkers.tsx
import React, { memo, useEffect, useState } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, View, StyleSheet } from 'react-native';
import { Stop } from '@/types/map';

interface StopMarkersProps {
  stops: Stop[];
  routeId: string | undefined;
}

// Individual stop marker component
const StopMarker = memo(({ stop, routeId }: { stop: Stop; routeId: string | undefined }) => {
  // Start with tracksViewChanges true, then set to false after first render
  const [tracksChanges, setTracksChanges] = useState(true);
  
  useEffect(() => {
    // After the first render, disable tracking view changes
    const timer = setTimeout(() => {
      setTracksChanges(false);
    }, 500); // Give it time to render properly first
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      key={`${routeId}-stop-${stop.stop_id}`}
      coordinate={{
        latitude: stop.stop_lat,
        longitude: stop.stop_lon,
      }}
      zIndex={2}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksChanges}
    >
      <View style={styles.markerContainer}>
        <Text style={styles.markerText}>{stop.stop_sequence}</Text>
      </View>

      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>Stop #{stop.stop_id}</Text>
          {/* <Text>: {stop.stop_id}</Text> */}
        </View>
      </Callout>
    </Marker>
  );
});

// Main component that renders all stop markers
export const StopMarkers: React.FC<StopMarkersProps> = memo(({ stops, routeId }) => {
  return (
    <>
      {stops.map((stop) => (
        <StopMarker 
          key={`${routeId}-stop-${stop.stop_id}`} 
          stop={stop} 
          routeId={routeId} 
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: '#FF0000',
    borderRadius: 0,
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