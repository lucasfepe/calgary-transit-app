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

  // Add this to useMapState.ts
  const fitMapToRoute = () => {
    if (!routeShape || routeShape.length === 0) {
      console.log("No route shape data available");
      return;
    }

    console.log("Route shape structure:",
      `Arrays: ${routeShape.length}`,
      `First array length: ${routeShape[0]?.length || 0}`,
      `Sample point: ${JSON.stringify(routeShape[0]?.[0] || "none")}`
    );

    // Find boundaries
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    let validPointCount = 0;

    routeShape.forEach((shape, shapeIndex) => {
      if (!Array.isArray(shape)) {
        console.log(`Shape at index ${shapeIndex} is not an array:`, shape);
        return;
      }

      shape.forEach((point, pointIndex) => {
        // Debug the structure of each point
        if (pointIndex === 0) {
          console.log(`Sample point from shape ${shapeIndex}:`, JSON.stringify(point));
        }

        if (!point || !Array.isArray(point) || point.length < 2) {
          return;
        }

        // Check both possible coordinate orders
        let lat, lon;

        // Try [longitude, latitude] order (GeoJSON standard)
        if (Math.abs(point[1]) <= 90 && Math.abs(point[0]) <= 180) {
          lon = point[0];
          lat = point[1];
          validPointCount++;

          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
        }
        // Try [latitude, longitude] order (alternative format)
        else if (Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180) {
          lat = point[0];
          lon = point[1];
          validPointCount++;

          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
        } else {
          console.log(`Invalid coordinate at shape ${shapeIndex}, point ${pointIndex}:`, point);
        }
      });
    });

    console.log(`Found ${validPointCount} valid coordinates. Bounds:`,
      `lat: ${minLat.toFixed(6)}-${maxLat.toFixed(6)}`,
      `lon: ${minLon.toFixed(6)}-${maxLon.toFixed(6)}`);

    if (validPointCount > 0 && mapRef.current) {
      // Rest of your function to fit map to these bounds...
      try {
        // Method 1: Using fitToCoordinates
        mapRef.current.fitToCoordinates(
          [
            { latitude: minLat, longitude: minLon },
            { latitude: maxLat, longitude: maxLon }
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          }
        );
      } catch (error) {
        console.error("Error using fitToCoordinates:", error);

        // Method 2: Manual calculation
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        const latDelta = Math.max(0.01, (maxLat - minLat) * 1.2);
        const lonDelta = Math.max(0.01, (maxLon - minLon) * 1.2);

        console.log("Using manual region calculation:",
          `center: (${centerLat.toFixed(6)}, ${centerLon.toFixed(6)})`,
          `delta: (${latDelta.toFixed(6)}, ${lonDelta.toFixed(6)})`);

        mapRef.current.animateToRegion({
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: latDelta,
          longitudeDelta: lonDelta
        }, 1000);
      }
    } else {
      console.warn("No valid route coordinates found to fit map");
    }
  };

  // Then call this method from selectRouteById after loading the route

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

      // Fit the map to show the entire route
      if (routeShape && routeShape.length > 0 && routeShape[0].length > 0) {
        // Wait a moment for the route data to fully load and render
        setTimeout(() => {
          fitMapToRoute();
        }, 200);
      } else {
        console.log("No route shape data available after loading route");
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

    let currentEffectiveLoc = location;
    if (!location) {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        setManualLocation(currentLocation);
        currentEffectiveLoc = currentLocation;
      } catch (error) {
        console.error("Error getting manual location during refresh:", error);
      }
    }

    // Now set region based on radius and user's current location
    if (currentEffectiveLoc) {
      const { latitude, longitude } = currentEffectiveLoc.coords;

      // Validate coordinates
      if (latitude && longitude &&
        !isNaN(latitude) && !isNaN(longitude) &&
        Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {

        const { latitudeDelta, longitudeDelta } = getDeltaForDistance(radius);

        console.log(`Refreshing map to: (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) with radius ${radius}km`);

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
      } else {
        console.error("Invalid coordinates in location object:", latitude, longitude);
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
    selectRouteById,
    fitMapToRoute,
  };
};