// types/map.ts

export interface Cluster {
    pointCount: number;
    coordinate: {
      latitude: number;
      longitude: number;
    };
  }
  
  export interface MapPoint {
    id: string;
    latitude: number;
    longitude: number;
    location: {
      latitude: number;
      longitude: number;
    };
    // Add other properties as needed
  }
  
  // You can also export other map-related types here
  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }