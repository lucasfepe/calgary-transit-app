// components/map/MapScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles } from "./styles";
import { MapControls } from "./components/MapControls";
import { MapOverlays } from "./components/MapOverlays";
import { MapContent } from "./components/MapContent";
import { useMapState } from "./hooks/useMapState";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { findRoutesNearMe } from "@/services/transit/tripMapping/api";
import { Route } from '@/types';
import { useAuth } from '@/contexts/authContext';
import AdminButton from '@/components/admin/AdminButton';
import Constants from "expo-constants";
import { getTopPosition } from "@/utils/platformUtils";

// Define the navigation type
type RootStackParamList = {
  Map: undefined;
  AdminDashboard: undefined;
};

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { isAdmin } = useAuth();
  const mapRef = useRef<MapView>(null);
  const mapState = useMapState(mapRef);
  const [controlsVisible, setControlsVisible] = useState(false);

  // Add state to cache nearby routes and track last search parameters
  const [nearbyRoutesCache, setNearbyRoutesCache] = useState<Route[]>([]);
  const [lastSearchParams, setLastSearchParams] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);

  const getGoogleMapsApiKey = () => {
    const apiKey = Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key is missing or using placeholder. Maps may not work properly.');
      return null;
    }
    return apiKey;
  };
  const apiKey = getGoogleMapsApiKey();
  useEffect(() => {
    if (!apiKey) {
      console.warn('No valid Google Maps API key found in app config');
    } else {
      console.log('Google Maps API key is configured');
    }
  }, [apiKey]);
  // Function to find routes near the user
  const handleFindRoutesNearMe = async (): Promise<Route[]> => {
    if (!mapState.effectiveLocation) {
      console.error("No location available");
      return [];
    }

    const { latitude, longitude } = mapState.effectiveLocation.coords;

    // Check if we already have results for these exact parameters
    if (lastSearchParams &&
      lastSearchParams.latitude === latitude &&
      lastSearchParams.longitude === longitude &&
      lastSearchParams.radius === mapState.radius) {
      console.log("Using cached nearby routes results");
      return nearbyRoutesCache;
    }

    // Convert km to meters 
    const distanceMeters = mapState.radius * 1000;

    try {
      const result = await findRoutesNearMe(latitude, longitude, distanceMeters);

      if (result.success && result.data) {
        // Cache the results and search parameters
        setNearbyRoutesCache(result.data);
        setLastSearchParams({ latitude, longitude, radius: mapState.radius });
        return result.data;
      } else {
        console.error("Error finding routes:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error finding routes:", error);
      return [];
    }
  };

  // Handle selecting a route without changing map center
  const handleSelectRoute = (routeId: string) => {
    // Select the route without changing the map center
    mapState.selectRouteById(routeId);

    // Ensure the map stays centered on the user's current location
    if (mapState.effectiveLocation) {
      const { latitude, longitude } = mapState.effectiveLocation.coords;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: mapState.region.latitudeDelta,
        longitudeDelta: mapState.region.longitudeDelta
      }, 3000);
    }
  };

  // Navigate to admin dashboard
  const handleAdminPress = () => {
    navigation.navigate('AdminDashboard');
  };

  return (
    <View style={styles.container}>
      <MapControls
        radius={mapState.radius}
        onRadiusChange={mapState.setRadius}
        isLoading={mapState.isLoading}
        onRefresh={async () => {
          await mapState.handleRefresh(); 
          setControlsVisible(false);      
        }}
        hasLocation={!!mapState.effectiveLocation}
        onFindRoutesNearMe={handleFindRoutesNearMe}
        onSelectRoute={handleSelectRoute}
        controlsVisible={controlsVisible}
    setControlsVisible={setControlsVisible}
      />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapState.region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        onPress={() => {
          console.log("Map pressed, clearing selection");
          mapState.clearSelection();
        }}
        onRegionChangeComplete={mapState.setRegion}
        onUserLocationChange={mapState.onUserLocationChange}
        mapPadding={{
          top: getTopPosition(30, 0),  // Adjust this value to move the button down
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <MapContent
          mapState={mapState}
        />
      </MapView>

      <ErrorDisplay
        locationError={mapState.locationError}
        transitError={mapState.transitError}
      />

      <MapOverlays isLoading={mapState.isLoading || mapState.isLoadingRoute} />

      {/* Admin Button - only shown to admin users */}
      {isAdmin && (
        <AdminButton
          onPress={handleAdminPress}
          style={styles.adminButton}
        />
      )}
    </View>
  );
};

// Add this to your styles.ts file
// export const styles = {
//   ...existingStyles,
//   adminButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     zIndex: 10,
//   }
// };

export default MapScreen;