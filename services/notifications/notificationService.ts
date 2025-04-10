import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPermission } from './types';

export const notificationService = {
    async setupNotificationChannel() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    },

    async requestPermissions(): Promise<NotificationPermission> {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return {
                status: finalStatus,
                granted: false,
            };
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return {
            status: finalStatus,
            granted: true,
            token,
        };
    },

    async registerForPushNotifications(): Promise<string | undefined> {
        await this.setupNotificationChannel();
        const permission = await this.requestPermissions();
        
        if (!permission.granted) {
            throw new Error('Failed to get push token for push notification!');
        }

        console.log('Push Token:', permission.token);
        return permission.token;
    }
};