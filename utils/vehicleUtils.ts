// src/utils/vehicleUtils.ts
import { VehicleType } from '../types/vehicles';

export const determineVehicleType = (vehicle: any): VehicleType => {
    const label = vehicle.vehicle?.label?.toLowerCase() || '';
    const routeId = vehicle.trip?.routeId?.toString() || '';

    if (routeId === '201' || routeId === '202' || label.includes('train') || label.includes('ctrain')) {
        return 'TRAIN';
    } else if (label.includes('access') || label.includes('handicap')) {
        return 'HANDICAP_BUS';
    }
    return 'BUS';
};