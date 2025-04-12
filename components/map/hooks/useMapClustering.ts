import { useMemo } from 'react';
import { Vehicle } from '@/types/vehicles';
import { Cluster, Point, Region } from '../types';
import { createPointsFromVehicles } from '../clustering/utils/pointUtils';
import { getClusterRadius } from '../clustering/utils/clusterRadius';
import { createNewCluster } from '../clustering/utils/clusterCreation';
import { wouldMarkersOverlap } from '../clustering/utils/clusterProcessing';
import { 
  findNearbyClusters, 
  splitLargeClusters 
} from '../clustering/utils/clusterProcessing';
import { calculateClusterCenter } from '../utils/clusterUtils';

export const useMapClustering = (vehicles: Vehicle[], region: Region): Cluster[] => {
  return useMemo(() => {
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

    return clusters;
  }, [vehicles, region.latitudeDelta]);
};