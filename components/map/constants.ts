// components/map/constants.ts
import { Dimensions } from 'react-native';
import { LocationObject } from 'expo-location'; // Add this import

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0922 * ASPECT_RATIO;

export const MAP_CONSTANTS = {
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  ZOOM_LEVELS: {
    FAR: 0.1,
    MEDIUM: 0.05,
    CLOSE: 0.02
  },
  initialRegion: (location: LocationObject | null) => ({
    latitude: location?.coords.latitude || 51.0447,
    longitude: location?.coords.longitude || -114.0719,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  })
};

export const CLUSTERING_CONSTANTS = {
  MAX_CLUSTER_SIZE: {
    FAR: 20,      // More points allowed in clusters when zoomed out
    MEDIUM: 10,    // Medium amount of points for middle zoom
    CLOSE: 5       // Fewer points when zoomed in close
  },
  RADIUS: {
    FAR: 50,
    MEDIUM: 35,
    CLOSE: 20
  },

  // Size of the marker icon in pixels (approximate)
  MARKER_SIZE: {
    WIDTH: 40,
    HEIGHT: 40,
  },
  // Buffer zone around markers (in pixels) to prevent too-close positioning
  BUFFER: 0
};
