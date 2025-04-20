// hooks/useRouteData.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Stop } from '@/types/map';
import NetInfo from '@react-native-community/netinfo';
import { tripMappingService } from '@/services/transit/tripMappingService';

export const useRouteData = () => {
    const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
    const [routeShape, setRouteShape] = useState<number[][][] | null>(null);
    const [routeStops, setRouteStops] = useState<Stop[] | null>(null);
    const [routeLongName, setRouteLongName] = useState<string | null>(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Use refs to compare previous and current data
    const prevRouteStopsRef = useRef<Stop[] | null>(null);
    
    // This effect ensures we only update state when data actually changes
    useEffect(() => {
        prevRouteStopsRef.current = routeStops;
    }, [routeStops]);

    const loadRouteData = useCallback(async (routeId: string | undefined) => {
        // Check network status
        const netInfo = await NetInfo.fetch();
        const shouldUseOnlyCache = !netInfo.isConnected ||
            (netInfo.isConnected && netInfo.details?.isConnectionExpensive);

        if (!routeId) {
            setActiveRouteId(null);
            setRouteShape(null);
            setRouteStops(null);
            setRouteLongName(null); 
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Use the loadRouteDetails method from tripMappingService
            const result = await tripMappingService.loadRouteDetails(routeId);

            if (result.success && result.data) {
                setActiveRouteId(routeId);
                setRouteShape(result.data.shape);
                
                // Only update stops if they've actually changed
                const newStops = result.data.stops;
                const prevStops = prevRouteStopsRef.current;
                
                // Simple deep comparison for stops
                const stopsChanged = !prevStops || 
                    prevStops.length !== newStops.length ||
                    JSON.stringify(prevStops) !== JSON.stringify(newStops);
                
                if (stopsChanged) {
                    setRouteStops(newStops);
                }
                console.log("result.data.route_long_name:", result.data.route_long_name);
                // Store the route name information
                setRouteLongName(result.data.route_long_name || null);
            } else {
                setActiveRouteId(routeId);
                setRouteShape(null);
                setRouteStops(null);
                setRouteLongName(null);
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
        setRouteLongName(null); 
        if (prevRouteStopsRef.current) {
            prevRouteStopsRef.current = null;
        }
    }, []);

    return {
        activeRouteId,
        routeShape,
        routeStops,
        routeLongName, 
        isLoading,
        error,
        loadRouteData,
        clearRouteData,
        clearAllCachedRoutes: tripMappingService.clearRouteDataCache.bind(tripMappingService)
    };
};