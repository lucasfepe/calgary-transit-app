// hooks/useRouteData.ts
import { useState, useCallback } from 'react';
import { Stop } from '@/types/map';
import NetInfo from '@react-native-community/netinfo';
import { tripMappingService } from '@/services/transit/tripMappingService';

export const useRouteData = () => {
    const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
    const [routeShape, setRouteShape] = useState<number[][][] | null>(null);
    const [routeStops, setRouteStops] = useState<Stop[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRouteData = useCallback(async (routeId: string | undefined) => {
        // Check network status
        const netInfo = await NetInfo.fetch();
        const shouldUseOnlyCache = !netInfo.isConnected ||
            (netInfo.isConnected && netInfo.details?.isConnectionExpensive);

        if (!routeId) {
            setActiveRouteId(null);
            setRouteShape(null);
            setRouteStops(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Use the new loadRouteDetails method from tripMappingService
            const result = await tripMappingService.loadRouteDetails(routeId);

            if (result.success && result.data) {
                setActiveRouteId(routeId);
                setRouteShape(result.data.shape);
                setRouteStops(result.data.stops);
            } else {
                setActiveRouteId(routeId);
                setRouteShape(null);
                setRouteStops(null);
                if (result.error) {
                    setError(shouldUseOnlyCache ?
                        "Network unavailable and route not in cache" :
                        result.error);
                }
            }
        } catch (err) {
            console.error("Error loading route data:", err);
            setError("Failed to load route data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearRouteData = useCallback(() => {
        setActiveRouteId(null);
        setRouteShape(null);
        setRouteStops(null);
    }, []);

    return {
        activeRouteId,
        routeShape,
        routeStops,
        isLoading,
        error,
        loadRouteData,
        clearRouteData,
        clearAllCachedRoutes: tripMappingService.clearRouteDataCache.bind(tripMappingService)
    };
};