import { Cluster, Point } from '../../types';
import { getDistance, calculateClusterCenter } from '../../utils/clusterUtils';
import { CLUSTERING_CONSTANTS, MAP_CONSTANTS } from '../../constants';
import { getPixelDistance } from './distanceCalculation';

export const findNearbyClusters = (
  point: Point,
  clusters: Cluster[],
  clusterRadius: number,
  latitudeDelta: number
): Cluster[] => {
  return clusters.filter(cluster => {
    const distance = getDistance(point, cluster.coordinate, latitudeDelta);
    return distance < clusterRadius;
  });
};

export const wouldMarkersOverlap = (
    point1: Point,
    point2: Point,
    latitudeDelta: number
  ): boolean => {
    const pixelDistance = getPixelDistance(point1, point2, latitudeDelta);
    const minDistance = CLUSTERING_CONSTANTS.MARKER_SIZE.WIDTH + CLUSTERING_CONSTANTS.BUFFER;
    
    return pixelDistance < minDistance;
  };

const getMaxClusterSize = (latitudeDelta: number): number => {
    if (latitudeDelta > MAP_CONSTANTS.ZOOM_LEVELS.FAR) {
      return CLUSTERING_CONSTANTS.MAX_CLUSTER_SIZE.FAR;
    } else if (latitudeDelta > MAP_CONSTANTS.ZOOM_LEVELS.MEDIUM) {
      return CLUSTERING_CONSTANTS.MAX_CLUSTER_SIZE.MEDIUM;
    } else {
      return CLUSTERING_CONSTANTS.MAX_CLUSTER_SIZE.CLOSE;
    }
  };

export const splitLargeClusters = (clusters: Cluster[], latitudeDelta: number): void => {
    const maxSize = getMaxClusterSize(latitudeDelta);
    
    clusters.forEach(cluster => {
      if (cluster.points.length > maxSize) {
        const midPoint = Math.floor(cluster.points.length / 2);
        const newPoints = cluster.points.splice(midPoint);
        
        clusters.push({
          id: `cluster-${clusters.length}`,
          coordinate: calculateClusterCenter(newPoints),
          numPoints: newPoints.length,
          points: newPoints,
        });
        
        cluster.numPoints = cluster.points.length;
        cluster.coordinate = calculateClusterCenter(cluster.points);
      }
    });
  };