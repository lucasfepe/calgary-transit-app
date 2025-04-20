// services/transit/tripMapping/types.ts
import { Stop } from "@/types/map";

export interface RouteData {
    tripIds: number[];
    shape: number[][][];
    stops: Stop[];
    routeLongName?: string;
}

export interface RouteMapping {
    [routeId: string]: RouteData;
}

export interface RouteDataBE {
    trip_ids: number[];
    shape: number[][][];
    stops: Stop[];
}

export interface RouteMappingBE {
    [routeId: string]: RouteDataBE;
}

export interface TripToRouteIndex {
    [tripId: string]: string;
}

export interface ErrorResponse {
    message: string;
}
export interface RouteDetails {
    shape: number[][][];
    route_long_name?: string;
    stops: Stop[];
}
export interface RouteDetailsResult {
    success: boolean;
    data?: RouteDetails;
    error?: string;
}

export interface MappingResult {
    success: boolean;
    error?: string;
}