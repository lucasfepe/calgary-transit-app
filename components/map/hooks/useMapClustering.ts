// components/map/hooks/useMapClustering.ts
import { useMemo, useRef, useEffect } from 'react';
import { Vehicle } from '@/types/vehicles';
import { Cluster, Point, Region } from '../types';
import { wouldMarkersOverlap } from '../clustering/utils/clusterProcessing';
import { calculateClusterCenter } from '../utils/clusterUtils';

export const useMapClustering = (
  vehicles: Vehicle[],
  region: Region,
  lastVehicleUpdateTime: number = 0,
  selectedVehicle: Vehicle | null,
  activeRouteId: string | undefined | null
): Cluster[] => {
  const prevClustersRef = useRef<Cluster[]>([]);
  const prevVehiclesRef = useRef<Vehicle[]>([]);
  const prevLatDeltaRef = useRef<number>(region.latitudeDelta);
  const prevUpdateTimeRef = useRef<number>(lastVehicleUpdateTime);

  const renderCountRef = useRef(0);
  useEffect(() => { renderCountRef.current++; });

  return useMemo(() => {
    if (
      vehicles === prevVehiclesRef.current &&
      Math.abs(region.latitudeDelta - prevLatDeltaRef.current) < 0.0001 &&
      lastVehicleUpdateTime === prevUpdateTimeRef.current &&
      prevClustersRef.current.length > 0
    ) {
      return prevClustersRef.current;
    }

    prevVehiclesRef.current = vehicles;
    prevLatDeltaRef.current = region.latitudeDelta;
    prevUpdateTimeRef.current = lastVehicleUpdateTime;

    if (!vehicles.length) return [];

    const singles: Point[] = [];
    const clusterable: Point[] = [];

    vehicles.forEach(vehicle => {
      if (
        (selectedVehicle && vehicle.id === selectedVehicle.id) ||
        (activeRouteId && vehicle.routeId === activeRouteId)
      ) {
        singles.push({
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          vehicle
        });
      } else {
        clusterable.push({
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          vehicle
        });
      }
    });

    const clusters: Cluster[] = [];
    clusterable.forEach(point => {
      let addedToCluster = false;
      for (const cluster of clusters) {
        if (wouldMarkersOverlap(point, cluster.points[0], region.latitudeDelta)) {
          cluster.points.push(point);
          cluster.numPoints++;
          cluster.coordinate = calculateClusterCenter(cluster.points);
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
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
  
    // Add "singles" as their own clusters
    singles.forEach(single => {
      clusters.push({
        id: `single-${single.vehicle.id}`,
        coordinate: { latitude: single.latitude, longitude: single.longitude },
        numPoints: 1,
        points: [single],
      });
    });

    prevClustersRef.current = clusters;
    return clusters;
  }, [vehicles, region.latitudeDelta, lastVehicleUpdateTime, selectedVehicle, activeRouteId]);
};