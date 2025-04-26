// components/map/hooks/useMapState.ts
import { useState, useRef, useEffect } from "react";
import * as Location from 'expo-location';
import MapView from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { useTransitData } from "../../../hooks/useTransitData";
import { useRouteData } from "../../../hooks/useRouteData";
import { useMapClustering } from "./useMapClustering";
import { MAP_CONSTANTS } from "../constants";
import type { Region } from "../types";
import { Vehicle } from "@/types/vehicles";

export const useMapState = (mapRef: React.RefObject<MapView>) => {
  const { location, errorMsg: locationError, refreshLocation } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const [region, setRegion] = useState<Region>(
    MAP_CONSTANTS.initialRegion(location)
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<Location.LocationObject | null>(null);

  const hasLoadedDataRef = useRef(false);

  // Use either the hook location or our manual location
  const effectiveLocation = location || manualLocation;

  const {
    filteredVehicles,
    isLoading,
    error: transitError,
    mappingError,
    refreshData,
    lastVehicleUpdateTime
  } = useTransitData({ location: effectiveLocation, radius });

  const {
    activeRouteId,
    routeShape,
    routeStops,
    routeLongName,
    loadRouteData,
    clearRouteData
  } = useRouteData();

  const clusters = useMapClustering(filteredVehicles, region, lastVehicleUpdateTime, selectedVehicle, activeRouteId);

  const getDeltaForDistance = (radiusKm: number) => {
    // delta ≈ (km to fit viewport) / (km per degree lat)
    const latitudeDelta = (radiusKm * 2) / 111; // 1 degree = 111km
    const longitudeDelta = latitudeDelta;
    return { latitudeDelta, longitudeDelta };
  };

  // Adjust map region when radius changes
  useEffect(() => {
    if (effectiveLocation) {
      const { latitude, longitude } = effectiveLocation.coords;
      const { latitudeDelta, longitudeDelta } = getDeltaForDistance(radius);

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      };
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
    // eslint-disable-next-line
  }, [radius, effectiveLocation]);

  // Get location directly from the device if the hook isn't providing it
  useEffect(() => {
    if (!location && !manualLocation) {
      console.log("Attempting to get location directly");

      (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();

          if (status !== 'granted') {
            console.log("No location permission");
            return;
          }

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

      refreshData();
      hasLoadedDataRef.current = true;
    }
  }, [effectiveLocation, isLoading, refreshData]);

  // Reset data loaded flag when radius changes
  useEffect(() => {
    hasLoadedDataRef.current = false;
  }, [radius]);

  const clearSelection = () => {
    console.log("Clearing vehicle selection");
    setSelectedVehicle(null);
    clearRouteData();
    setIsLoadingRoute(false);
  };

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsLoadingRoute(true);
    try {
      await loadRouteData(vehicle.routeId);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // New function to handle route selection from the nearby routes list
  const selectRouteById = async (routeId: string) => {
    console.log("Selecting route by ID:", routeId);
    clearSelection(); // Clear any existing selection
    setIsLoadingRoute(true);
    try {
      await loadRouteData(routeId);

      // Find a vehicle on this route to select (if any)
      const vehicleOnRoute = filteredVehicles.find(v => v.routeId === routeId);
      if (vehicleOnRoute) {
        setSelectedVehicle(vehicleOnRoute);
      }

      // If we have route shape data, animate the map to show it
      if (routeShape && routeShape.length > 0 && routeShape[0].length > 0) {
        // Calculate the center of the route
        let latSum = 0;
        let lonSum = 0;
        let pointCount = 0;

        // Sample points from the route to find the center
        routeShape.forEach(shape => {
          shape.forEach(point => {
            latSum += point[0];
            lonSum += point[1];
            pointCount++;
          });
        });

        if (pointCount > 0) {
          const centerLat = latSum / pointCount;
          const centerLon = lonSum / pointCount;

          // Calculate appropriate zoom level based on route extent
          // This is a simple approach - you might want to calculate actual bounds
          const newRegion = {
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: 0.05, // Adjust as needed
            longitudeDelta: 0.05, // Adjust as needed
          };

          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      }
    } catch (error) {
      console.error("Error selecting route by ID:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleRefresh = async () => {
    if (isLoading) return;

    console.log("Manual refresh triggered");

    await refreshLocation();

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

    refreshData();
  };

  const onUserLocationChange = (event: any) => {
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

  return {
    radius,
    setRadius,
    region,
    setRegion,
    selectedVehicle,
    isLoadingRoute,
    effectiveLocation,
    filteredVehicles,
    isLoading,
    locationError,
    transitError,
    mappingError,
    activeRouteId,
    routeShape,
    routeStops,
    routeLongName,
    clusters,
    clearSelection,
    handleVehicleSelect,
    handleRefresh,
    onUserLocationChange,
    selectRouteById // Add this to the return object
  };
};