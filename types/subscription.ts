// types/subscription.ts
export interface TimeRange {
  weekdays: number[];
  startTime: Date | string;
  endTime: Date | string;
}

export interface NotificationSettings {
  enabled: boolean;
  minTimeBetweenNotifications: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface Subscription {
  _id: string;
  userId: string;
  route_id: string;
  stop_id: string;
  times: TimeRange[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  notificationDistance?: number;
  lastNotifiedVehicleId?: string | null;
  lastNotifiedAt?: string | null;
  notificationCount?: number;
  notificationSettings?: NotificationSettings;
  proximityStatus?: {
    isNearby: boolean;
    distance: number;
    estimatedArrival: string;
    vehicleId: string;
    timestamp: number;           
    isApproaching: boolean;      
    stopPassed: boolean;         
    minimumDistance?: number;    
    previousDistance?: number;
  };
  routeDetails?: {
    route_short_name: string;
    route_long_name: string;
    route_category: string;
  };
  stopDetails?: {
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
  };
}

export interface SubscriptionFormData {
  route_id: string;
  stop_id: string;
  times: TimeRange[];
  active?: boolean;
  notificationDistance?: number;
  notificationSettings?: NotificationSettings;
}