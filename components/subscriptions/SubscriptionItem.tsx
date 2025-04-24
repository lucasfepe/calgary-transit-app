// components/subscriptions/SubscriptionItem.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '@/types/subscription';
import { styles } from './styles/subscriptionItemStyles';

interface SubscriptionItemProps {
  subscription: Subscription;
  onDelete: () => void;
  onEdit: () => void;
}

const SubscriptionItem = ({ subscription, onDelete, onEdit }: SubscriptionItemProps) => {
  // Animation value for glowing effect
  const glowAnimation = useRef(new Animated.Value(0)).current;

  // Start pulsing animation when a vehicle is nearby
  useEffect(() => {
    if (subscription.proximityStatus?.isNearby) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Reset animation when not nearby
      glowAnimation.setValue(0);
    }

    return () => {
      glowAnimation.stopAnimation();
    };
  }, [subscription.proximityStatus?.isNearby]);

  // Interpolate the animation value to create a glowing shadow
  const shadowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  // Format weekdays to display
  const formatWeekdays = (weekdays: number[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays.map(day => days[day]).join(', ');
  };

  // Format time to display in 12-hour format
  const formatTime = (timeValue: string | Date): string => {
    const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format estimated arrival time
  const formatEstimatedArrival = (time: Date | string | undefined) => {
    if (!time) return 'Unknown';
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format distance to be more readable
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const isNearby = subscription.proximityStatus?.isNearby;

  return (
    <Animated.View
      style={[
        styles.container,
        !subscription.active && styles.inactiveContainer,
        isNearby && {
          shadowColor: '#FF3B30',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius: 10,
          elevation: 8,
          borderColor: '#FF3B30',
          borderWidth: 1,
        }
      ]}
    >
      {/* Status indicator */}
      {!subscription.active && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Inactive</Text>
        </View>
      )}

      {/* Proximity Alert Badge */}
      {isNearby && (
        <View style={proximityStyles.alertBadge}>
          <Ionicons name="notifications" size={16} color="white" />
          <Text style={proximityStyles.alertText}>Vehicle Approaching</Text>
        </View>
      )}

      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <Text
            style={[styles.routeId, !subscription.active && styles.inactiveText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Route {subscription.route_id} - {subscription.routeDetails?.route_long_name}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.stopId, !subscription.active && styles.inactiveText]}>
          Stop: {subscription.stop_id} - {subscription.stopDetails?.stop_name}
        </Text>

        {subscription.times && subscription.times.length > 0 && (
          <View style={styles.timesContainer}>
            {subscription.times.map((time, index) => (
              <View key={index} style={[styles.timeItem, !subscription.active && styles.inactiveTimeItem]}>
                <Text style={[styles.weekdays, !subscription.active && styles.inactiveText]}>
                  {formatWeekdays(time.weekdays)}
                </Text>
                <Text style={[styles.timeRange, !subscription.active && styles.inactiveText]}>
                  {formatTime(time.startTime)} - {formatTime(time.endTime)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Proximity Information */}
        {isNearby && (
          <View style={proximityStyles.proximityContainer}>
            <View style={proximityStyles.proximityItem}>
              <Ionicons name="location" size={16} color="#FF3B30" />
              <Text style={proximityStyles.proximityText}>
                Distance: {formatDistance(subscription.proximityStatus!.distance)}
              </Text>
            </View>
            {/* <View style={proximityStyles.proximityItem}>
              <Ionicons name="time" size={16} color="#FF3B30" />
              <Text style={proximityStyles.proximityText}>
                ETA: {formatEstimatedArrival(subscription.proximityStatus.estimatedArrival)}
              </Text>
            </View> */}
            {/* <View style={proximityStyles.proximityItem}>
              <Ionicons name="bus" size={16} color="#FF3B30" />
              <Text style={proximityStyles.proximityText}>
                Vehicle: {subscription.proximityStatus.vehicleId}
              </Text>
            </View> */}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const proximityStyles = StyleSheet.create({
  alertBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  proximityContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  proximityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  proximityText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
});

export default SubscriptionItem;