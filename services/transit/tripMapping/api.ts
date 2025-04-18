// services/transit/tripMapping/api.ts
import axios from "axios";
import { TRIP_MAPPING_API_URL } from '@/config';
import { RouteMappingBE, MappingResult, RouteDetailsResult, ErrorResponse } from './types';
import { Route } from '@/types'

// Helper function for consistent error handling
const handleApiError = (error: any, errorContext: string): { success: false, error: string } => {
  if (axios.isAxiosError(error)) {
    const errorMessage = (error.response?.data as ErrorResponse)?.message || error.message;
    console.error(`Error ${errorContext}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }

  const errorMessage = error instanceof Error ? error.message : `Unknown error ${errorContext}`;
  console.error(`Error ${errorContext}:`, errorMessage);
  return {
    success: false,
    error: errorMessage
  };
};

/**
 * Fetches trip mappings for the given trip IDs
 */
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
    return handleApiError(error, 'fetching trip mappings');
  }
}

/**
 * Fetches detailed information for a specific route
 */
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
    return handleApiError(error, 'loading route details');
  }
}

/**
 * Finds transit routes near a specific location
 */
export async function findRoutesNearMe(
  latitude: number, 
  longitude: number, 
  distance: number
): Promise<{
  success: boolean;
  data?: Route[];
  error?: string;
}> {
  try {
    // Updated to use the correct endpoint path

    const response = await axios.get(`${TRIP_MAPPING_API_URL}/routes/nearby`, {
      params: {
        lat: latitude,
        lon: longitude,
        distance: distance
      }
    });
    console.log("params:", JSON.stringify({
      lat: latitude,
      lon: longitude,
      distance: distance
    }))
    console.log("res:",JSON.stringify(response.data))
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleApiError(error, 'fetching nearby routes');
  }
}