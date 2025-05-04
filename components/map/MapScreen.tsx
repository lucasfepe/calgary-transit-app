// components/map/MapScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { ScreenNavigationProp, ScreenRouteProp } from '@/types/navigation';

const MapScreen = () => {
  // Use the proper navigation and route types from navigation.ts
  const navigation = useNavigation<ScreenNavigationProp<'Map'>>();
  const route = useRoute<ScreenRouteProp<'Map'>>();
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

  // Handle route selection from navigation params
  useEffect(() => {
    const selectedRouteId = route.params?.selectedRouteId;
    if (selectedRouteId) {
      console.log("Route selected from subscription:", selectedRouteId);
      
      // Create a function to attempt route selection
      const attemptRouteSelection = () => {
        if (mapState.effectiveLocation) {
          console.log("Selecting route:", selectedRouteId);
          mapState.selectRouteById(selectedRouteId);
          return true;
        }
        return false;
      };
      
      // Try immediately if location is available
      if (!attemptRouteSelection()) {
        // If not, set up a retry mechanism
        console.log("Location not available yet, setting up retry");
        const checkInterval = setInterval(() => {
          if (attemptRouteSelection()) {
            clearInterval(checkInterval);
            console.log("Successfully selected route after waiting for location");
          }
        }, 500);
        
        // Clean up interval if component unmounts
        return () => clearInterval(checkInterval);
      }
    }
  }, [route.params, mapState.effectiveLocation]);

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
    if (mapState.effectiveLocation && mapRef.current) {
      const { latitude, longitude } = mapState.effectiveLocation.coords;

      // Add validation to ensure coordinates are valid
      if (latitude && longitude &&
        !isNaN(latitude) && !isNaN(longitude) &&
        Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {

        console.log("Animating map to:", latitude, longitude);

        // Use a short timeout to ensure the map is ready
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: mapState.region.latitudeDelta || 0.02,
            longitudeDelta: mapState.region.longitudeDelta || 0.02
          }, 1000); // Reduced animation time
        }, 100);
      } else {
        console.error("Invalid coordinates:", latitude, longitude);
      }
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
          top: getTopPosition(30, 0),
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

export default MapScreen;