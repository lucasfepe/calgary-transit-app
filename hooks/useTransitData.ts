// hooks/useTransitData.ts - Fixed location detection
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

  // Debug location
  useEffect(() => {
    if (location) {
      console.log("LOCATION AVAILABLE:", 
        location.coords.latitude.toFixed(6), 
        location.coords.longitude.toFixed(6)
      );
    } else {
      console.log("LOCATION NOT AVAILABLE");
    }
  }, [location]);

  const processVehicles = useCallback(async (allVehicles: Vehicle[]) => {
    try {
      // Only proceed if location is available
      if (!location) {
        console.log("Location not available yet, skipping vehicle processing");
        return;
      }

      // Filter vehicles by distance first
      const nearbyVehicles = allVehicles.filter(vehicle => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          vehicle.latitude,
          vehicle.longitude
        );
        return distance <= radius;
      });

      // Only get trip IDs for nearby vehicles
      const tripIds = nearbyVehicles
        .map(v => v.tripId)
        .filter(tripId => tripId !== 'N/A');
      
      console.log("count trip ids:", tripIds.length);
      
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
    // Skip if location is not available
    if (!location) {
      console.log("Location not available yet, skipping fetch");
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    console.log("STARTING FETCH with location:", 
      location.coords.latitude.toFixed(6), 
      location.coords.longitude.toFixed(6)
    );
    
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
  }, [location, processVehicles]);

  // This effect runs once when the component mounts and then whenever location changes
  useEffect(() => {
    // Skip if no location or if initial fetch already done
    if (!location) {
      console.log("Location not available yet, waiting...");
      return;
    }
    
    if (initialFetchDoneRef.current) {
      console.log("Initial fetch already done, skipping");
      return;
    }
    
    console.log("Location available, doing initial fetch");
    fetchData();
    initialFetchDoneRef.current = true;
    
    // Set up interval for periodic refresh
    console.log("Setting up refresh interval");
    intervalIdRef.current = setInterval(() => {
      console.log("Periodic refresh triggered");
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [location, fetchData]);

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

  // Add a manual refresh function that can be called from UI
  const manualRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    initialFetchDoneRef.current = false; // Reset to allow fetch
    if (location) {
      fetchData();
      initialFetchDoneRef.current = true;
    }
  }, [location, fetchData]);

  return {
    vehicles,
    filteredVehicles,
    isLoading,
    error,
    mappingError,
    refreshData: manualRefresh, // Use the manual refresh function
  };
};