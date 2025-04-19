// components/subscriptions/SubscriptionScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { getSubscriptionsWithRouteDetails, deleteSubscription } from '@/services/subscriptions/subscriptionService';
import SubscriptionItem from './SubscriptionItem';
import { Subscription } from '@/types/subscription';

type RootStackParamList = {
    Subscriptions: undefined;
    AddSubscription: undefined;
    Map: undefined;
  };
  
  // Create a typed navigation prop
  type SubscriptionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SubscriptionScreen = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<SubscriptionScreenNavigationProp >();

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionsWithRouteDetails();
      setSubscriptions(data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const handleAddSubscription = () => {
    navigation.navigate('AddSubscription');
  };

  const handleGoToMap = () => {
    navigation.navigate('Map');
  };

  const handleDeleteSubscription = async (id: string) => {
    Alert.alert(
      'Delete Subscription',
      'Are you sure you want to delete this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(id);
              fetchSubscriptions();
              Alert.alert('Success', 'Subscription deleted successfully');
            } catch (err) {
              console.error('Error deleting subscription:', err);
              Alert.alert('Error', 'Failed to delete subscription');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSubscriptions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No active subscriptions</Text>
          <Text style={styles.emptySubText}>
            Add a subscription to receive notifications about your favorite routes and stops.
          </Text>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SubscriptionItem 
              subscription={item} 
              onDelete={() => handleDeleteSubscription(item._id)} 
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddSubscription}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'

  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;