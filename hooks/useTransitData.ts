// hooks/useTransitData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle } from '../types/vehicles';
import { transitService } from '../services/transit/transitService';
import { tripMappingService } from '../services/transit/tripMappingService';
import { calculateDistance } from '../utils/distance';
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

  const processVehicles = useCallback(async (allVehicles: Vehicle[]) => {
    try {
      // Filter vehicles by distance first
      const nearbyVehicles = location
        ? allVehicles.filter(vehicle => {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            vehicle.latitude,
            vehicle.longitude
          );
          return distance <= radius;
        })
        : allVehicles;

      // Only get trip IDs for nearby vehicles
      const tripIds = nearbyVehicles
        .map(v => v.tripId)
        .filter(tripId => tripId !== 'N/A');

      // Update mappings only for nearby vehicles
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
  }, [location, radius]);

  // Define fetchData using useCallback with stable dependencies
  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setMappingError(null);

      // Collect vehicles first
      const collectedVehicles: Vehicle[] = [];

      transitService.onVehicleUpdate = (vehicle) => {
        collectedVehicles.push(vehicle);
      };

      // Fetch transit data
      await transitService.fetchTransitDataInChunks();

      // Process all collected vehicles
      await processVehicles(collectedVehicles);

      setIsLoading(false);
      console.log("Fetch data done");
    } catch (err) {
      setError('Failed to fetch transit data');
      console.error('Error in useTransitData:', err);
      setIsLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [processVehicles]);

  // Initial data fetch - only run once
  useEffect(() => {
    // Skip if already done
    if (initialFetchDoneRef.current) return;
    
    const initFetch = async () => {
      console.log("initFetchb4");
      await fetchData();
      console.log("initFetchaftr");
      initialFetchDoneRef.current = true;
    };

    initFetch();

    return () => {
      transitService.onVehicleUpdate = undefined;
    };
  }, [fetchData]);

  // Periodic refresh - only set up once
  useEffect(() => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    
    console.log("Setting up refresh interval");
    intervalIdRef.current = setInterval(() => {
      console.log("ln 112");
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [fetchData]);

  // Filter vehicles by distance for the UI
  const filteredVehicles = location
    ? vehicles.filter((vehicle) => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        vehicle.latitude,
        vehicle.longitude
      );
      return distance <= radius;
    })
    : vehicles;

  return {
    vehicles,
    filteredVehicles,
    isLoading,
    error,
    mappingError,
    refreshData: fetchData,
  };
};