import { Stop } from '@/types/map';

export interface RouteDataCache {
    [routeId: string]: {
        shape: number[][][];
        stops: Stop[];
        timestamp: number;
    }
}

export interface CacheInfo {
    routeCount: number;
    totalSizeBytes: number;
    totalSizeMB: number;
}