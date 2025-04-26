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

export interface Stop {
  stop_id: number;
  stop_lat: number;
  stop_lon: number;
  stop_sequence?: number;
  stop_name?: string;
}

// In your types.ts file
export interface Route {
  _id: string;
  route_short_name: string;
  route_category?: string;
  route_long_name?: string;
  multilinestring?: {
    type: "MultiLineString";
    coordinates: number[][][];
  };
}
export interface RouteShort {
  _id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_category?: string;
}
