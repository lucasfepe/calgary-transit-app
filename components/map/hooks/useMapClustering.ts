// components/map/hooks/useMapClustering.ts
import { useMemo, useRef, useEffect } from 'react';
import { Vehicle } from '@/types/vehicles';
import { Cluster, Point, Region } from '../types';
import { wouldMarkersOverlap } from '../clustering/utils/clusterProcessing';
import { calculateClusterCenter } from '../utils/clusterUtils';

export const useMapClustering = (
  vehicles: Vehicle[],
  region: Region,
  lastVehicleUpdateTime: number = 0
): Cluster[] => {
  // Use refs to store previous values for comparison
  const prevClustersRef = useRef<Cluster[]>([]);
  const prevVehiclesRef = useRef<Vehicle[]>([]);
  const prevLatDeltaRef = useRef<number>(region.latitudeDelta);
  const prevUpdateTimeRef = useRef<number>(lastVehicleUpdateTime);

  // Log when the hook is called
  console.log('[useMapClustering] Hook called with:', {
    vehiclesCount: vehicles.length,
    latitudeDelta: region.latitudeDelta.toFixed(6),
    lastUpdateTime: new Date(lastVehicleUpdateTime).toLocaleTimeString()
  });

  // Track render count
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current++;
    console.log(`[useMapClustering] Render count: ${renderCountRef.current}`);
  });

  return useMemo(() => {
    // Skip recalculation if vehicles haven't changed, zoom level is the same,
    // and no new vehicle data has been fetched
    if (
      vehicles === prevVehiclesRef.current &&
      Math.abs(region.latitudeDelta - prevLatDeltaRef.current) < 0.0001 &&
      lastVehicleUpdateTime === prevUpdateTimeRef.current
    ) {
      console.log('[useMapClustering] 🟢 Skipping recalculation, using cached clusters');
      return prevClustersRef.current;
    }

    console.log('[useMapClustering] 🔴 Recalculating clusters due to:', {
      vehiclesChanged: vehicles !== prevVehiclesRef.current,
      zoomChanged: Math.abs(region.latitudeDelta - prevLatDeltaRef.current) >= 0.0001,
      updateTimeChanged: lastVehicleUpdateTime !== prevUpdateTimeRef.current
    });

    // Update refs with current values
    prevVehiclesRef.current = vehicles;
    prevLatDeltaRef.current = region.latitudeDelta;
    prevUpdateTimeRef.current = lastVehicleUpdateTime;

    if (!vehicles.length) return [];

    const clusters: Cluster[] = [];
    const points: Point[] = vehicles.map(vehicle => ({
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      vehicle,
    }));

    points.forEach(point => {
      // Check if this point would overlap with any existing cluster
      let addedToCluster = false;

      for (const cluster of clusters) {
        if (wouldMarkersOverlap(point, cluster.points[0], region.latitudeDelta)) {
          // Add to existing cluster if it would overlap
          cluster.points.push(point);
          cluster.numPoints++;
          cluster.coordinate = calculateClusterCenter(cluster.points);
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        // Create new cluster if no overlap
        clusters.push({
          id: `cluster-${clusters.length}`,
          coordinate: {
            latitude: point.latitude,
            longitude: point.longitude,
          },
          numPoints: 1,
          points: [point],
        });
      }
    });

    console.log(`[useMapClustering] Created ${clusters.length} clusters from ${vehicles.length} vehicles`);

    // Store result in ref for future comparison
    prevClustersRef.current = clusters;
    return clusters;
  }, [vehicles, region.latitudeDelta, lastVehicleUpdateTime]);
};