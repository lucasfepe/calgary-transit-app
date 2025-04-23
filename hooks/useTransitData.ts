// hooks/useTransitData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle } from '../types/vehicles';
import { transitService } from '../services/transit/transitService';
import { tripMappingService } from '../services/transit/tripMappingService';
import * as Location from 'expo-location';

interface UseTransitDataProps {
  location: Location.LocationObject | null;
  radius: number;
}

export const useTransitData = ({ location, radius }: UseTransitDataProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mappingError, setMappingError] = useState<string | null>(null);

  // Use refs to track fetch state and prevent duplicate fetches
  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<Location.LocationObject | null>(null);

  // Update the location ref when location changes
  useEffect(() => {
    if (location) {
      locationRef.current = location;
    }
  }, [location]);

  const processVehicles = useCallback(async (allVehicles: Vehicle[]) => {
    try {
      // Only proceed if location is available
      if (!locationRef.current) {
        console.log("Location not available yet, skipping vehicle processing");
        return;
      }

      // Only get trip IDs for vehicles
      const tripIds = allVehicles
        .map(v => v.tripId)
        .filter(tripId => tripId !== 'N/A');

      console.log("Processing trip ids:", tripIds.length);

      // Update mappings for all vehicles
      if (tripIds.length > 0) {
        const result = await tripMappingService.updateMappings(tripIds);
        if (!result.success) {
          setMappingError(result.error || 'Failed to update trip mappings');
        }
      }

      // Add route IDs to all vehicles (even those without mappings)
      const vehiclesWithRoutes = allVehicles.map(vehicle => ({
        ...vehicle,
        routeId: vehicle.tripId ? tripMappingService.getRouteForTrip(vehicle.tripId) || undefined : undefined
      }));

      setVehicles(vehiclesWithRoutes);
    } catch (err) {
      console.error('Error processing vehicles:', err);
      setMappingError('Failed to process vehicles');
    }
  }, []);

  // Define fetchData using useCallback with stable dependencies
  const fetchData = useCallback(async () => {
    // Skip if location is not available
    if (!locationRef.current) {
      console.log("No location available for fetch");
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping");
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setMappingError(null);

      console.log("Fetching vehicles near:",
        locationRef.current.coords.latitude.toFixed(6),
        locationRef.current.coords.longitude.toFixed(6),
        "with radius:", radius, "miles"
      );

      // Use the new method to fetch vehicles directly from backend
      const fetchedVehicles = await transitService.fetchVehiclesNearby(
        locationRef.current.coords.latitude,
        locationRef.current.coords.longitude,
        radius
      );

      // Process the vehicles to add route information
      await processVehicles(fetchedVehicles);

      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch transit data');
      console.error('Error in useTransitData:', err);
      setIsLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [radius, processVehicles]);

  // This effect runs ONCE when the component mounts to set up the initial fetch and interval
  useEffect(() => {
    // Set up the initial fetch when location becomes available
    const checkLocationAndFetch = () => {
      if (locationRef.current && !initialFetchDoneRef.current) {
        console.log("Location available, doing initial fetch");
        fetchData();
        initialFetchDoneRef.current = true;
      }
    };

    // Check immediately
    checkLocationAndFetch();

    // Set up a watcher to check for location if not available yet
    const locationCheckInterval = setInterval(() => {
      if (!initialFetchDoneRef.current) {
        checkLocationAndFetch();
      } else {
        // Once initial fetch is done, clear this interval
        clearInterval(locationCheckInterval);
      }
    }, 500);

    // Set up interval for periodic refresh - ONLY ONCE
    console.log("Setting up refresh interval");
    intervalIdRef.current = setInterval(() => {
      console.log("Periodic refresh triggered");
      fetchData();
    }, 30000); // Refresh every 30 seconds

    // Cleanup function
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      clearInterval(locationCheckInterval);
    };
  }, [fetchData]); // Only depend on fetchData, not location

  // Add a manual refresh function that can be called from UI
  const manualRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    if (locationRef.current) {
      fetchData();
    }
  }, [fetchData]);

  return {
    vehicles,
    filteredVehicles: vehicles, // No need to filter again, just return the same vehicles
    isLoading,
    error,
    mappingError,
    refreshData: manualRefresh,
  };
};