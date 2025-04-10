import * as Location from 'expo-location';

export interface LocationServiceError {
    message: string;
    code?: string;
}

export interface LocationServiceConfig {
    accuracy: Location.Accuracy;
    timeInterval: number;
    distanceInterval: number;
}