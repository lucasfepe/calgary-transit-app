// components/map/components/StopMarkers.tsx
import React, { memo, useEffect, useState } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stop } from '@/types/map';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHookType } from '@/types';
import { COLORS } from '@/constants';

interface StopMarkersProps {
  stops: Stop[];
  routeId: string | undefined;
  routeDisplayText?: string | undefined;
}

// Individual stop marker component
const StopMarker = memo(({
  stop,
  routeId,
  routeDisplayText
}: {
  stop: Stop;
  routeId: string | undefined;
  routeDisplayText?: string | undefined;
}) => {
  const navigation = useNavigation<NavigationHookType>();
  // Start with tracksViewChanges true, then set to false after first render
  const [tracksChanges, setTracksChanges] = useState(true);

  useEffect(() => {
    // After the first render, disable tracking view changes
    const timer = setTimeout(() => {
      setTracksChanges(false);
    }, 500); // Give it time to render properly first

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = () => {
    console.log("Subscribing to stop:", stop.stop_id, "routeId:", routeId);
    if (!routeId) return;
    // Navigate to AddSubscription screen with pre-filled data
    navigation.navigate('AddSubscription', {
      routeId: routeId,
      routeDisplayText: routeDisplayText,
      stopId: stop.stop_id.toString(),
      stopName: stop.stop_name
    });
  };

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

      <Callout onPress={handleSubscribe}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>
            {stop.stop_name || `Stop #${stop.stop_id}`}
          </Text>
          <Text style={styles.calloutSubtitle}>ID: {stop.stop_id}</Text>

          {routeId && (
            <View
              style={styles.subscribeButton}
            >
              <Ionicons name="notifications-outline" size={16} color="white" />
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </View>
          )}
        </View>
      </Callout>
    </Marker>
  );
});

// Main component that renders all stop markers
export const StopMarkers: React.FC<StopMarkersProps> = memo(({ stops, routeId, routeDisplayText }) => {
  return (
    <>
      {stops.map((stop) => (
        <StopMarker
          key={`${routeId}-stop-${stop.stop_id}`}
          stop={stop}
          routeId={routeId}
          routeDisplayText={routeDisplayText}
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
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: COLORS.BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  subscribeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  }
});