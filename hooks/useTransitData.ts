import { useState, useEffect } from 'react';
import { Vehicle } from '../types/vehicles';
import { fetchTransitData } from '../services/transit/transitService';
import { calculateDistance } from '../utils/distance';
import * as Location from 'expo-location';

interface UseTransitDataProps {
  location: Location.LocationObject | null;
  radius: number;
}

interface UseTransitDataReturn {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useTransitData = ({ location, radius }: UseTransitDataProps): UseTransitDataReturn => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransitData();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transit data');
      console.error('Error in useTransitData:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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