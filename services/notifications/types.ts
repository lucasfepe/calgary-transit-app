export interface NotificationChannel {
    name: string;
    importance: number;
    vibrationPattern: number[];
    lightColor: string;
}

export interface NotificationPermission {
    status: string;
    granted: boolean;
    token?: string;
}