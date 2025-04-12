// hooks/useTransitData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle } from '../types/vehicles';
import { transitService } from '../services/transit/transitService';
import { calculateDistance } from '../utils/distance';
import * as Location from 'expo-location';

interface UseTransitDataProps {
  location: Location.LocationObject | null;
  radius: number;
  refreshInterval?: number;
}

export const useTransitData = ({ 
  location, 
  radius,
  refreshInterval = 30000 // Default to 30 seconds
}: UseTransitDataProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update the ref type to NodeJS.Timeout
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    let vehicleCount = 0;
    const expectedVehicles = 1000;

    try {
      setIsLoading(true);
      setError(null);
      setVehicles([]);
      
      const stream = transitService.streamTransitData();

      for await (const vehicle of stream) {
        if (!mountedRef.current) break;

        setVehicles(prev => [...prev, vehicle]);
        vehicleCount++;
        setLoadingProgress(Math.min((vehicleCount / expectedVehicles) * 100, 99));
      }

      if (mountedRef.current) {
        setLoadingProgress(100);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to fetch transit data');
        console.error('Error in useTransitData:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    fetchData();

    // setInterval returns NodeJS.Timeout
    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval]);

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

  const refreshData = useCallback(async () => {
    if (isLoading) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    await fetchData();

    // Update interval after manual refresh
    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);
  }, [fetchData, isLoading, refreshInterval]);

  return {
    vehicles,
    filteredVehicles,
    isLoading,
    loadingProgress,
    error,
    refreshData,
    lastUpdated,
  };
};