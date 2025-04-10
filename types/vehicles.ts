export interface Vehicle {
    id: string;
    latitude: number;
    longitude: number;
    routeId: string;
    label: string;
    speed: number;
    vehicleType: string;
}

export type VehicleType = 'BUS' | 'TRAIN' | 'HANDICAP_BUS';