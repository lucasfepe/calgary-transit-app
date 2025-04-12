// components/map/types.ts
import { Vehicle } from '../../types/vehicles';
  
  export interface Point {
    latitude: number;
    longitude: number;
    vehicle: Vehicle;
  }
  
  export interface Cluster {
    id: string;
    coordinate: {
      latitude: number;
      longitude: number;
    };
    numPoints: number;
    points: Array<Point>;
  }
  
  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }


  