// components/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { adminApiService } from '../../services/api/adminApiService';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClearCache = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await adminApiService.clearCache();
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
            title={isLoading ? "Processing..." : "Clear Application Cache"} 
            onPress={handleClearCache}
            disabled={isLoading}
            color="#d32f2f"
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