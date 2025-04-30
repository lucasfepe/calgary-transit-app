import React, { useState } from 'react';
import { View, Button, Text, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { ScreenNavigationProp } from '@/types/navigation';
import notificationService from '@/services/notifications/notificationService';
import { makeApiCall } from '@/services/auth/authRequest';
import { BASE_API_URL } from '@/config';
import { COLORS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

// First ensure TestNotifications is added to RootStackParamList in types/navigation.ts
// RootStackParamList should include: TestNotifications: undefined;

interface NotificationResponse {
    success: boolean;
    message?: string;
}

// Props interface for the component
interface TestNotificationsProps {
    navigation: ScreenNavigationProp<'TestNotifications'>;
}


const TestNotifications = ({ navigation }: TestNotificationsProps) => {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const getToken = async () => {
        setLoading(true);
        try {
            const newToken = await notificationService.registerForPushNotifications();
            setToken(newToken);
            Alert.alert('Success', 'Token obtained successfully!');
        } catch (error) {
            console.error('Error getting token:', error);
            Alert.alert('Error', 'Failed to get push token');
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!token) {
            Alert.alert('Error', 'Please get a token first');
            return;
        }

        setLoading(true);
        try {
            const response = await makeApiCall<NotificationResponse>(
                `${BASE_API_URL}/notifications/test`,
                'POST',
                { token }
            );

            if (response && response.success) {
                Alert.alert('Success', 'Test notification sent!');
            } else {
                Alert.alert('Error', (response && response.message) || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            Alert.alert('Error', 'Failed to send test notification');
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={COLORS.BLUE}
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />
                <Text style={styles.title}>Push Notification Testing</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="notifications" size={20} color={COLORS.BLUE} /> Push Token
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.BLUE} />
                    ) : (
                        <>
                            <Button
                                title="Get Push Token"
                                onPress={getToken}
                                disabled={loading}
                                color={COLORS.BLUE}
                            />

                            {token && (
                                <View style={styles.tokenContainer}>
                                    <Text style={styles.tokenLabel}>Token Type:</Text>
                                    <Text style={styles.tokenType}>
                                        {token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')
                                            ? 'Expo Token'
                                            : 'FCM Token'}
                                    </Text>

                                    <Text style={styles.tokenLabel}>Token Value:</Text>
                                    <Text selectable style={styles.tokenValue}>{token}</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {token && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="paper-plane" size={20} color={COLORS.BLUE} /> Test Notification
                        </Text>
                        <Text style={styles.description}>
                            Send a test notification to your device to verify push notifications are working correctly.
                        </Text>
                        <Button
                            title="Send Test Notification"
                            onPress={sendTestNotification}
                            disabled={loading}
                            color={COLORS.RED}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    description: {
        marginBottom: 16,
        color: '#666',
    },
    tokenContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.BLUE,
    },
    tokenLabel: {
        fontWeight: 'bold',
        marginTop: 8,
        color: '#555',
    },
    tokenType: {
        marginBottom: 8,
        color: '#333',
    },
    tokenValue: {
        fontSize: 12,
        fontFamily: 'monospace',
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 4,
        color: '#333',
    }
});

export default TestNotifications;