// components/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { adminApiService } from '../../services/api/adminApiService';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const navigation = useNavigation();

  const handleClearCache = async (): Promise<void> => {
    setIsLoading(true);
    setCurrentOperation('cache');
    try {
      const response = await adminApiService.clearCache();
      if (response.success) {
        Alert.alert('Success', 'Cache cleared successfully');
      } else {
        Alert.alert('Error', response.message);
      }
    // components/admin/AdminDashboard.tsx (continued)
  } catch (error) {
    Alert.alert('Error', `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
    setCurrentOperation(null);
  }
};

const handleClearPushTokens = async (): Promise<void> => {
  // Show confirmation dialog before proceeding
  Alert.alert(
    'Confirmation Required',
    'This will delete all push notification tokens and log out all users. This action cannot be undone. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Proceed',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          setCurrentOperation('tokens');
          try {
            const response = await adminApiService.clearAllPushTokens();
            if (response.success) {
              Alert.alert('Success', `All push tokens cleared and users logged out. 
                ${response.usersAffected} users affected. 
                ${response.firebaseSessionsRevoked} Firebase sessions revoked.`);
            } else {
              Alert.alert('Error', response.message);
            }
          } catch (error) {
            Alert.alert('Error', `Failed to clear tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setIsLoading(false);
            setCurrentOperation(null);
          }
        }
      }
    ]
  );
};

const handleBroadcastNotification = async (): Promise<void> => {
  // Confirm before sending a system-wide notification
  Alert.alert(
    'Confirm Broadcast',
    'This will send a notification to all users. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send Broadcast',
        onPress: async () => {
          setIsLoading(true);
          setCurrentOperation('broadcast');
          try {
            const response = await adminApiService.broadcastNotification();
            if (response.success) {
              Alert.alert('Success', `Notification broadcast successful!\nSent to ${response.sentCount} of ${response.totalTokens} devices.`);
            } else {
              Alert.alert('Error', response.message);
            }
          } catch (error) {
            Alert.alert('Error', `Failed to broadcast notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setIsLoading(false);
            setCurrentOperation(null);
          }
        }
      }
    ]
  );
};

return (
  <ScrollView style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Management</Text>
      <Text style={styles.description}>
        Use these controls to manage system-wide settings and perform maintenance tasks.
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading && currentOperation === 'cache' ? "Processing..." : "Clear Application Cache"}
          onPress={handleClearCache}
          disabled={isLoading}
          color="#d32f2f"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading && currentOperation === 'tokens' ? "Processing..." : "Clear Push Tokens & Logout Users"}
          onPress={handleClearPushTokens}
          disabled={isLoading}
          color="#ff9800" // Orange color for warning action
        />
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Text style={styles.description}>
        Test and manage push notifications to users.
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading && currentOperation === 'broadcast' ? "Sending..." : "Broadcast Test Notification"}
          onPress={handleBroadcastNotification}
          disabled={isLoading}
          color={COLORS.RED}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Advanced Notification Testing"
          onPress={() => navigation.navigate('TestNotifications' as never)}
          color={COLORS.BLUE}
          disabled={isLoading}
        />
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transit Data</Text>
      <Text style={styles.description}>
        View and manage transit data including routes, stops, and schedules.
      </Text>
      {/* Add more admin controls here */}
    </View>
  </ScrollView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 16,
  backgroundColor: '#f5f5f5',
},
section: {
  backgroundColor: 'white',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,
},
description: {
  color: '#666',
  marginBottom: 16,
},
buttonContainer: {
  marginTop: 8,
},
});

export default AdminDashboard;