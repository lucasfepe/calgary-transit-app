import { Cluster, Point } from '../../types';
import { calculateClusterCenter } from '../../utils/clusterUtils';

export const createNewCluster = (point: Point, clusterId: string): Cluster => {
  return {
    id: `cluster-${clusterId}`,
    coordinate: {
      latitude: point.latitude,
      longitude: point.longitude,
    },
    numPoints: 1,
    points: [point],
  };
};