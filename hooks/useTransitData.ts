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

  // Define fetchData using useCallback to maintain reference stability
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setVehicles([]); // Clear existing vehicles
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
    }, 30000); // Refresh every 30 seconds (changed from 3000000)

    return () => clearInterval(interval);
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