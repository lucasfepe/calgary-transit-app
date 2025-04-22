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
  
  // Add state to cache nearby routes and track last search parameters
  const [nearbyRoutesCache, setNearbyRoutesCache] = useState<Route[]>([]);
  const [lastSearchParams, setLastSearchParams] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);
  
  // Function to find routes near the user
  const handleFindRoutesNearMe = async (radius: number): Promise<Route[]> => {
    if (!mapState.effectiveLocation) {
      console.error("No location available");
      return [];
    }
    
    const { latitude, longitude } = mapState.effectiveLocation.coords;
    
    // Check if we already have results for these exact parameters
    if (lastSearchParams && 
        lastSearchParams.latitude === latitude && 
        lastSearchParams.longitude === longitude && 
        lastSearchParams.radius === radius) {
      console.log("Using cached nearby routes results");
      return nearbyRoutesCache;
    }
    
    // Convert miles to meters (1 mile ≈ 1609.34 meters)
    const distanceMeters = radius * 1609.34;
    
    try {
      const result = await findRoutesNearMe(latitude, longitude, distanceMeters);
      
      if (result.success && result.data) {
        // Cache the results and search parameters
        setNearbyRoutesCache(result.data);
        setLastSearchParams({ latitude, longitude, radius });
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
      }, 500);
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
        onRefresh={mapState.handleRefresh}
        hasLocation={!!mapState.effectiveLocation}
        onFindRoutesNearMe={handleFindRoutesNearMe}
        onSelectRoute={handleSelectRoute}
      />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapState.region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        onPress={mapState.clearSelection}
        onRegionChangeComplete={mapState.setRegion}
        onUserLocationChange={mapState.onUserLocationChange}
        mapPadding={{
          top: 20,  // Adjust this value to move the button down
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