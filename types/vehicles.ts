export interface Vehicle {
    id: string;
    latitude: number;
    longitude: number;
    tripId: string;
    label: string;
    speed: number;
    vehicleType: string;
    routeId?: string
}

export type VehicleType = 'BUS' | 'TRAIN' | 'HANDICAP_BUS';