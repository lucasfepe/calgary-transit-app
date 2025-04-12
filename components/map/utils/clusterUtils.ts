// components/map/utils/clusterUtils.ts

interface Point {
    latitude: number;
    longitude: number;
  }
  
  /**
   * Calculates the screen-space distance between two points
   */
  export const getDistance = (
    point1: Point,
    point2: Point,
    latitudeDelta: number
  ) => {
    const screenPoints = {
      x: (point1.longitude - point2.longitude) / latitudeDelta,
      y: (point1.latitude - point2.latitude) / latitudeDelta,
    };
    
    return Math.sqrt(
      screenPoints.x * screenPoints.x + screenPoints.y * screenPoints.y
    );
  };
  
  /**
   * Calculates the center point of a cluster
   */
  export const calculateClusterCenter = (points: Point[]) => {
    const sumLat = points.reduce((sum, point) => sum + point.latitude, 0);
    const sumLng = points.reduce((sum, point) => sum + point.longitude, 0);
    return {
      latitude: sumLat / points.length,
      longitude: sumLng / points.length,
    };
  };
  
  export type { Point };

  