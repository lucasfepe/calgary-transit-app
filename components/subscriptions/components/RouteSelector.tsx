// components/subscriptions/components/RouteSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllRoutes } from '@/services/transit/tripMapping/api';
import { RouteShort } from '@/types';
import { styles } from '../styles/addSubscriptionStyles';
import { Alert } from 'react-native';

interface RouteSelectorProps {
  onRouteSelect: (routeId: string, displayText: string) => void;
  disabled: boolean;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({ onRouteSelect, disabled }) => {
  const [routeSearchText, setRouteSearchText] = useState('');
  const [routes, setRoutes] = useState<RouteShort[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteShort[]>([]);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);

  // Fetch all routes when component mounts
  useEffect(() => {
    const loadRoutes = async () => {
      setRoutesLoading(true);
      try {
        const result = await fetchAllRoutes();
        if (result.success && result.data) {
          setRoutes(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch routes');
        }
      } catch (error) {
        console.error('Failed to load routes:', error);
        Alert.alert('Error', 'Failed to load route options. Please try again.');
      } finally {
        setRoutesLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Filter routes based on search text
  useEffect(() => {
    if (routeSearchText) {
      const filtered = routes.filter(route => 
        route.route_id?.toLowerCase().includes(routeSearchText.toLowerCase()) ||
        route.route_short_name?.toLowerCase().includes(routeSearchText.toLowerCase()) ||
        route.route_long_name?.toLowerCase().includes(routeSearchText.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [routeSearchText, routes]);

  const handleRouteSelect = (route: RouteShort) => {
    const routeId = route.route_id || route.route_short_name || '';
    const displayText = `${route.route_short_name} - ${route.route_long_name}`;
    
    onRouteSelect(routeId, displayText);
    setRouteSearchText(displayText);
    setShowRouteDropdown(false);
  };

  const renderRouteItem = ({ item }: { item: RouteShort }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => handleRouteSelect(item)}
    >
      <Text style={styles.dropdownItemText}>
        {item.route_short_name} - {item.route_long_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.autocompleteContainer}>
        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowRouteDropdown(true)}
          disabled={disabled || routesLoading}
        >
          {routesLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={routeSearchText ? styles.inputText : styles.placeholderText}>
              {routeSearchText || "Select a route"}
            </Text>
          )}
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Route Selection Modal */}
      <Modal
        visible={showRouteDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRouteDropdown(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Route</Text>
              <TouchableOpacity onPress={() => setShowRouteDropdown(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search routes..."
              value={routeSearchText}
              onChangeText={setRouteSearchText}
              autoCapitalize="none"
            />
            
            {routesLoading ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
            ) : (
              <FlatList
                data={filteredRoutes}
                renderItem={renderRouteItem}
                keyExtractor={(item) => item.route_id || item._id || item.route_short_name || String(Math.random())}
                style={styles.dropdownList}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    No routes found. Try a different search term.
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RouteSelector;