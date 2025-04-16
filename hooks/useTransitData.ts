// hooks/useTransitData.ts
import { useState, useEffect, useCallback } from 'react';
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
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);

  const processVehicles = useCallback(async (vehicles: Vehicle[]) => {
    const tripIds = vehicles
      .map(v => v.tripId)
      .filter(tripId => tripId !== 'N/A');

    if (tripIds.length > 0) {
      const result = await tripMappingService.updateMappings(tripIds);
      if (!result.success) {
        setMappingError(result.error || 'Failed to update trip mappings');
      }
    }

    // Now that mappings are updated, process vehicles with routes
    const vehiclesWithRoutes = vehicles.map(vehicle => ({
      ...vehicle,
      routeId: vehicle.tripId ? tripMappingService.getRouteForTrip(vehicle.tripId) || undefined : undefined
    }));

    setVehicles(vehiclesWithRoutes);
  }, []);

  // Define fetchData using useCallback to maintain reference stability
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setPendingVehicles([]); // Clear pending vehicles
      setVehicles([]); // Clear existing vehicles
      setMappingError(null);

      // Collect vehicles first
      const collectedVehicles: Vehicle[] = [];
      
      transitService.onVehicleUpdate = (vehicle) => {
        collectedVehicles.push(vehicle);
      };

      // Fetch transit data
      await transitService.fetchTransitDataInChunks();

      // Process all collected vehicles at once
      await processVehicles(collectedVehicles);

      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch transit data');
      console.error('Error in useTransitData:', err);
      setIsLoading(false);
    }
  }, [processVehicles]);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    const initFetch = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    initFetch();

    return () => {
      mounted = false;
      transitService.onVehicleUpdate = undefined;
    };
  }, [fetchData]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 3000000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

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