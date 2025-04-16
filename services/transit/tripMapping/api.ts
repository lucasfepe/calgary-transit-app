// services/transit/tripMapping/api.ts
import axios from "axios";
import { TRIP_MAPPING_API_URL } from '@/config';
import { RouteMappingBE, MappingResult, RouteDetailsResult, ErrorResponse } from './types';

export async function fetchTripMappings(tripIds: string[]): Promise<{
    success: boolean;
    data?: RouteMappingBE;
    error?: string;
}> {
    try {
        // Call the lightweight endpoint
        const response = await axios.post(`${TRIP_MAPPING_API_URL}/tripmapping`, {
            tripIds
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = (error.response?.data as ErrorResponse)?.message || error.message;
            console.error('Error fetching trip mappings:', errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching mappings';
        console.error('Error fetching trip mappings:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function fetchRouteDetails(routeId: string): Promise<{
    success: boolean;
    data?: { shape: number[][][]; stops: any[] };
    error?: string;
}> {
    try {
        // Call the detailed endpoint
        const response = await axios.get(`${TRIP_MAPPING_API_URL}/tripmapping/route/${routeId}`);

        return {
            success: true,
            data: {
                shape: response.data.shape || [],
                stops: response.data.stops || []
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error loading route details';
        console.error('Error loading route details:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}