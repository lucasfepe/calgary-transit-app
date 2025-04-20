// services/notifications/types.ts
export interface PushNotificationToken {
    token: string;
    platform: 'ios' | 'android' | 'web';
  }
  
  export interface NotificationSettings {
    enabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    minTimeBetweenNotifications: number; // in minutes
  }
  
  export interface NotificationResponse {
    success: boolean;
    message: string;
  }
  
  export interface NotificationPayload {
    routeId: string;
    stopId: string;
    vehicleId: string;
    distance: number;
  }