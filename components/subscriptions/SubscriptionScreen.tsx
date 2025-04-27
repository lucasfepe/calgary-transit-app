// components/subscriptions/SubscriptionScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import { auth } from "@/firebaseConfig";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {
  getSubscriptionsWithRouteDetails,
  deleteSubscription,
} from "@/services/subscriptions/subscriptionService";
import {
  getActiveProximityAlerts,
  ProximityAlert,
  setupProximityNotificationHandlers,
} from "@/services/notifications/proximityAlertService";
import SubscriptionItem from "./SubscriptionItem";
import { Subscription } from "@/types/subscription";
import { RootStackParamList } from "@/types";
import { DeviceEventEmitter } from "react-native";
import { COLORS } from "@/constants";
import { getTopPosition } from "@/utils/platformUtils";

// Create a typed navigation prop
type SubscriptionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SubscriptionScreen = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [proximityAlerts, setProximityAlerts] = useState<Record<string, any>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<SubscriptionScreenNavigationProp>();

  // Set up notification handlers
  useEffect(() => {
    const cleanupNotifications = setupProximityNotificationHandlers();
    return cleanupNotifications;
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionsWithRouteDetails();
      setSubscriptions(data);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Initial load of alerts
    const loadAlerts = async () => {
      try {
        if (!refreshing) {
          const alerts = await getActiveProximityAlerts();
          console.log("setting initial alerts in scubscription screen:", alerts);
          setProximityAlerts(alerts);
        }
      } catch (err) {
        console.error("Error loading proximity alerts:", err);
      }
    };

    loadAlerts();

    // Set up event listener for alert changes
    const subscription = DeviceEventEmitter.addListener(
      "proximityAlertsChanged",
      (alerts) => {
        if (!refreshing) {
          console.log("setting alerts in scubscription screen:", alerts);
          setProximityAlerts(alerts);
        }
      }
    );

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [refreshing]);

  const handleEditSubscription = (subscription: Subscription) => {
    navigation.navigate("EditSubscription", { subscription });
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSubscriptions();
    } finally {
      setRefreshing(false);
    }
  };

  const subscriptionsWithProximity = subscriptions.map((subscription) => {
    const alert = proximityAlerts[subscription._id];
    if (alert) {
      return {
        ...subscription,
        proximityStatus: {
          isNearby: true,
          distance: alert.distance,
          vehicleId: alert.vehicleId,
          estimatedArrival: alert.estimatedArrival,
          // Add the new fields
          timestamp: alert.timestamp,
          isApproaching: alert.isApproaching,
          stopPassed: alert.stopPassed,
          minimumDistance: alert.minimumDistance,
          previousDistance: alert.previousDistance,
        },
      };
    }
    return subscription;
  });

  const handleAddSubscription = () => {
    navigation.navigate({
      name: "AddSubscription",
      params: {},
    });
  };

  const handleGoToMap = () => {
    navigation.navigate("Map");
  };

  const handleLogoPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              // The AuthContext should handle the navigation automatically
              console.log("User logged out successfully");
            } catch (error) {
              console.error("Error signing out: ", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };
  

  const handleDeleteSubscription = async (id: string) => {
    Alert.alert(
      "Delete Subscription",
      "Are you sure you want to delete this subscription?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubscription(id);
              fetchSubscriptions();
              Alert.alert("Success", "Subscription deleted successfully");
            } catch (err) {
              console.error("Error deleting subscription:", err);
              Alert.alert("Error", "Failed to delete subscription");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchSubscriptions}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alerts</Text>
        <TouchableOpacity onPress={handleLogoPress}>
  <Image
    source={require("@/assets/drop_logo.png")}
    style={styles.squareIcon}
  />
</TouchableOpacity>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No active subscriptions</Text>
          <Text style={styles.emptySubText}>
            Add a subscription to receive notifications about your favorite
            routes and stops.
          </Text>
        </View>
      ) : (
        <FlatList
          data={subscriptionsWithProximity}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SubscriptionItem
              subscription={item}
              onDelete={() => handleDeleteSubscription(item._id)}
              onEdit={() => handleEditSubscription(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddSubscription}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    paddingTop: getTopPosition(40, 10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapButtonText: {
    marginLeft: 4,
    color: "#007AFF",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.BLUE,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  squareIcon: {
    width: 50,
    height: 70,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: -25,
    marginTop: -20,
    // width: 50,
    // height: 60,
    // borderRadius: 8,
    // marginLeft: 8,
    // marginBottom: -15,
    // marginTop: -10,
  }
});

export default SubscriptionScreen;
