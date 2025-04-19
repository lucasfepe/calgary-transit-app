// components/subscriptions/SubscriptionItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '@/types/subscription';

interface SubscriptionItemProps {
  subscription: Subscription;
  onDelete: () => void;
}

const SubscriptionItem = ({ subscription, onDelete }: SubscriptionItemProps) => {
  // Format weekdays to display
  const formatWeekdays = (weekdays: number[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays.map(day => days[day]).join(', ');
  };

  // Format time to display in 12-hour format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeId} numberOfLines={1} ellipsizeMode="tail">
            Route {subscription.route_id} - {subscription.routeDetails?.route_long_name}
          </Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <Text style={styles.stopId}>Stop: {subscription.stop_id} - {subscription.stopDetails?.stop_name}</Text>
        
        {subscription.times && subscription.times.length > 0 && (
          <View style={styles.timesContainer}>
            {subscription.times.map((time, index) => (
              <View key={index} style={styles.timeItem}>
                <Text style={styles.weekdays}>
                  {formatWeekdays(time.weekdays)}
                </Text>
                <Text style={styles.timeRange}>
                  {formatTime(time.startTime)} - {formatTime(time.endTime)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,  // This allows the text to take available space but not push the icon
    marginRight: 8, // Add some margin between the text and the icon
  },
  deleteButton: {
    padding: 4,
  },
  stopId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timesContainer: {
    marginTop: 8,
  },
  timeItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  weekdays: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  timeRange: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default SubscriptionItem;