// services/transit/tripMapping/api.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { TRIP_MAPPING_API_URL } from '@/config';
import { RouteMappingBE, MappingResult, RouteDetailsResult, ErrorResponse } from './types';
import { Route, RouteShort } from '@/types';

// Helper function for consistent error handling
const handleApiError = (error: any, errorContext: string): { success: false, error: string } => {
  if (error instanceof Error) {
    const errorMessage = (error as ErrorResponse)?.message || error.message;
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
    // Call the lightweight endpoint using makeApiCall
    const response = await makeApiCall<{ data: RouteMappingBE }>(`${TRIP_MAPPING_API_URL}/tripmapping`, "POST", { tripIds });

    if (!response) {
      throw new Error('No response from API');
    }

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
    // Call the detailed endpoint using makeApiCall
    const response = await makeApiCall<{ shape: number[][][]; stops: any[] }>(`${TRIP_MAPPING_API_URL}/tripmapping/route/${routeId}`);

    if (!response) {
      throw new Error('No response from API');
    }

    return {
      success: true,
      data: {
        shape: response.shape || [],
        stops: response.stops || []
      }
    };
  } catch (error) {
    return handleApiError(error, 'loading route details');
  }
}

/**
 * Fetches all stops for a specific route
 */
export async function fetchStopsByRoute(routeId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Call the stops endpoint using makeApiCall
    const response = await makeApiCall<any>(`${TRIP_MAPPING_API_URL}/stops/route/${routeId}`);

    if (!response) {
      throw new Error('No response from API');
    }

    return {
      success: true,
      data: response
    };
  } catch (error) {
    return handleApiError(error, 'fetching stops for route');
  }
}

/**
 * Fetches all available transit routes
 */
export async function fetchAllRoutes(): Promise<{
  success: boolean;
  data?: RouteShort[];
  error?: string;
}> {
  try {
    // Call the routes endpoint using makeApiCall
    const response = await makeApiCall<Array<RouteShort>>(`${TRIP_MAPPING_API_URL}/routes`);

    if (!response) {
      throw new Error('No response from API');
    }

    // Transform the response to include route_id (using route_short_name as route_id)
    const routes = response.map(route => ({
      _id: route._id,
      route_id: route.route_short_name, // Using route_short_name as route_id for subscriptions
      route_short_name: route.route_short_name || '',
      route_long_name: route.route_long_name || '',
      route_category: route.route_category
    }));

    return {
      success: true,
      data: routes
    };
  } catch (error) {
    return handleApiError(error, 'fetching all routes');
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
    // Use makeApiCall with query parameters
    const response = await makeApiCall<{ routes: Route[] }>(`${TRIP_MAPPING_API_URL}/routes/nearby`, "GET", {
      lat: latitude,
      lon: longitude,
      distance: distance
    });

    if (!response) {
      throw new Error('No response from API');
    }

    console.log("params:", JSON.stringify({
      lat: latitude,
      lon: longitude,
      distance: distance
    }));
    console.log("res:", JSON.stringify(response));

    return {
      success: true,
      data: response.routes
    };
  } catch (error) {
    return handleApiError(error, 'fetching nearby routes');
  }
}