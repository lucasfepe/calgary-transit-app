// MapScreen.tsx - Direct approach
import React, { useState, useRef, useEffect } from "react";
import { View, Button, Text } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { useLocation } from "../../hooks/useLocation";
import { useTransitData } from "../../hooks/useTransitData";
import { useRouteData } from "../../hooks/useRouteData";
import { RadiusSelector } from "./RadiusSelector";
import { styles } from "./styles";
import { useMapClustering } from "./hooks/useMapClustering";
import { ClusterMarkers } from "./components/ClusterMarkers";
import { UserLocationMarker } from "./components/UserLocationMarker";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { MAP_CONSTANTS } from "./constants";
import type { Region } from "./types";
import { RouteShape } from "./components/RouteShape";
import { Vehicle } from "@/types/vehicles";
import { StopMarkers } from "./components/StopMarkers";

const MapScreen = () => {
  const { location, errorMsg: locationError, refreshLocation } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const [region, setRegion] = useState<Region>(
    MAP_CONSTANTS.initialRegion(location)
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<Location.LocationObject | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const hasLoadedDataRef = useRef(false);

  // Use either the hook location or our manual location
  const effectiveLocation = location || manualLocation;

  const {
    filteredVehicles,
    isLoading,
    error: transitError,
    mappingError,
    refreshData,
  } = useTransitData({ location: effectiveLocation, radius });

  const {
    activeRouteId,
    routeShape,
    routeStops,
    loadRouteData,
    clearRouteData
  } = useRouteData();

  const clusters = useMapClustering(filteredVehicles, region);

  // Get location directly from the device if the hook isn't providing it
  useEffect(() => {
    if (!location && !manualLocation) {
      console.log("Attempting to get location directly");
      
      (async () => {
        try {
          // Check if we have permission
          const { status } = await Location.getForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            console.log("No location permission");
            return;
          }
          
          // Get current position directly
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          console.log("Got manual location:", 
            currentLocation.coords.latitude.toFixed(6),
            currentLocation.coords.longitude.toFixed(6)
          );
          
          setManualLocation(currentLocation);
        } catch (error) {
          console.error("Error getting manual location:", error);
        }
      })();
    }
  }, [location, manualLocation]);

  // Load data when we have any location source
  useEffect(() => {
    if (effectiveLocation && !hasLoadedDataRef.current && !isLoading) {
      console.log("Location available (source: " + (location ? "hook" : "manual") + "), loading data");
      
      // Update map region
      const newRegion = {
        latitude: effectiveLocation.coords.latitude,
        longitude: effectiveLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      // Load transit data
      refreshData();
      hasLoadedDataRef.current = true;
    }
  }, [effectiveLocation, isLoading, refreshData]);

  // Reset data loaded flag when radius changes
  useEffect(() => {
    hasLoadedDataRef.current = false;
  }, [radius]);

  const clearSelection = () => {
    setSelectedVehicle(null);
    clearRouteData();
    setIsLoadingRoute(false);
  };

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    console.log("vehicle:", JSON.stringify(vehicle));
    setSelectedVehicle(vehicle);
    setIsLoadingRoute(true);
    try {
      await loadRouteData(vehicle.routeId);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleRefresh = async () => {
    if (isLoading) return;
    
    console.log("Manual refresh triggered");
    
    // Try to refresh location from hook
    await refreshLocation();
    
    // If hook location still not available, try to get it manually
    if (!location) {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        setManualLocation(currentLocation);
      } catch (error) {
        console.error("Error getting manual location during refresh:", error);
      }
    }
    
    // Refresh data regardless
    refreshData();
  };

  // Get map region from user location
  const onUserLocationChange = (event: any) => {
    // If we don't have location from hooks, use the map's user location
    if (!location && !manualLocation && event.nativeEvent.coordinate) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      console.log("Got location from map:", latitude.toFixed(6), longitude.toFixed(6));
      
      const mapLocation = {
        coords: {
          latitude,
          longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      setManualLocation(mapLocation);
    }
  };

  return (
    <View style={styles.container}>
      <RadiusSelector radius={radius} onRadiusChange={setRadius} />
      
      {/* Add manual refresh button */}
      <View style={styles.refreshButton}>
        <Button 
          title={isLoading ? "Loading..." : "Refresh Data"} 
          onPress={handleRefresh} 
          disabled={isLoading}
        />
        {!effectiveLocation && <Text style={styles.waitingText}>Waiting for location...</Text>}
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        onPress={clearSelection}
        onRegionChangeComplete={setRegion}
        onUserLocationChange={onUserLocationChange}
      >
        {routeShape && activeRouteId && (
          <RouteShape
            coordinates={routeShape}
            routeId={activeRouteId}
          />
        )}
        {routeStops && activeRouteId && (
          <StopMarkers stops={routeStops} routeId={activeRouteId} />
        )}
        {effectiveLocation && <UserLocationMarker location={effectiveLocation} />}
        <ClusterMarkers
          onVehicleSelect={handleVehicleSelect}
          clusters={clusters}
          selectedVehicle={selectedVehicle}
          activeRouteId={activeRouteId}
          isLoadingRoute={isLoadingRoute}
        />
      </MapView>

      <ErrorDisplay locationError={locationError} transitError={transitError} />
      
      {/* Show loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading transit data...</Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;