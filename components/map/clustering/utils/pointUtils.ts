import { Vehicle } from '@/types/vehicles';
import { Point } from '../../types';

export const createPointsFromVehicles = (vehicles: Vehicle[]): Point[] => {
  return vehicles.map(vehicle => ({
    latitude: vehicle.latitude,
    longitude: vehicle.longitude,
    vehicle,
  })).sort((a, b) => a.latitude - b.latitude);
};