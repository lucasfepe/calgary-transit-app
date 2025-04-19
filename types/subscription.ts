// types/subscription.ts
export interface TimeRange {
  weekdays: number[];
  startTime: string;
  endTime: string;
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
  routeDetails?: {
    route_short_name: string;
    route_long_name: string;
    route_color?: string;
    route_text_color?: string;
  };
  stopDetails?: {
    stop_name: string;
    stop_code?: string;
    stop_lat?: number;
    stop_lon?: number;
  };
}

export interface SubscriptionFormData {
  route_id: string;
  stop_id: string;
  times: TimeRange[];
  active?: boolean;
}