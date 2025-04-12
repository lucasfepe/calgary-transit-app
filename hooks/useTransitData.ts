// hooks/useTransitData.ts
import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '../types/vehicles';
import { transitService } from '../services/transit/transitService';
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

  // Define fetchData using useCallback to maintain reference stability
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setVehicles([]); // Clear existing vehicles

      // Set up vehicle update handler
      transitService.onVehicleUpdate = (vehicle) => {
        setVehicles(prev => [...prev, vehicle]);
      };

      // Start fetching data
      await transitService.fetchTransitDataInChunks();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch transit data');
      console.error('Error in useTransitData:', err);
      setIsLoading(false);
    }
  }, []);

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
    }, 30000000); // Refresh every 30 seconds

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
    refreshData: fetchData,
  };
};