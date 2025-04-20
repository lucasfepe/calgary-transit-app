// components/subscriptions/components/StopSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchStopsByRoute } from '@/services/transit/tripMapping/api';
import { styles } from '../styles/addSubscriptionStyles';

interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  stop_sequence?: number;
}

interface StopSelectorProps {
  routeId: string;
  onStopSelect: (stopId: string, stopName: string) => void;
  disabled: boolean;
  initialStopId?: string;
  initialStopName?: string;
}

const StopSelector: React.FC<StopSelectorProps> = ({ routeId, onStopSelect, disabled, initialStopId, 
  initialStopName }) => {
  const [stopSearchText, setStopSearchText] = useState('');
  const [selectedStopName, setSelectedStopName] = useState(initialStopName ||'');
  const [stops, setStops] = useState<Stop[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [showStopDropdown, setShowStopDropdown] = useState(false);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [initialValuesApplied, setInitialValuesApplied] = useState(false);

  // Call onStopSelect with initial values if provided
  useEffect(() => {
    if (initialStopId && initialStopName && !initialValuesApplied) {
      console.log("Applying initial stop values:", initialStopId, initialStopName);
      onStopSelect(initialStopId, initialStopName);
      setSelectedStopName(`${initialStopId} - ${initialStopName}`);
      setStopSearchText('');
      setInitialValuesApplied(true);
    }
  }, [initialStopId, initialStopName, onStopSelect, initialValuesApplied]);

  // Fetch stops when routeId changes
  useEffect(() => {
    if (!routeId) {
      setStops([]);
      setFilteredStops([]);
      if (!initialStopName) {
        setSelectedStopName('');
      }
      return;
    }

    // If we already have initialStopId and initialStopName, 
    // we can delay loading stops until user wants to change the selection
    if (initialStopId && initialStopName && !showStopDropdown) {
      return;
    }

    const loadStops = async () => {
      setStopsLoading(true);
      try {
        const result = await fetchStopsByRoute(routeId);
        if (result.success && result.data) {
          // Process the stops data
          const allStops: Stop[] = [];
          
          // The API returns stops grouped by trip, we need to flatten and deduplicate
          const tripData = result.data.trips || {};
          
          Object.values(tripData).forEach((tripStops: any) => {
            if (Array.isArray(tripStops)) {
              tripStops.forEach((stop: Stop) => {
                if (!allStops.some(s => s.stop_id === stop.stop_id)) {
                  allStops.push(stop);
                }
              });
            }
          });
          
          // Sort stops by name for better usability
          allStops.sort((a, b) => a.stop_name.localeCompare(b.stop_name));
          
          setStops(allStops);
          setFilteredStops(allStops);
        } else {
          throw new Error(result.error || 'Failed to fetch stops');
        }
      } catch (error) {
        console.error('Failed to load stops:', error);
        Alert.alert('Error', 'Failed to load stop options. Please try again.');
      } finally {
        setStopsLoading(false);
      }
    };

    loadStops();
  }, [routeId, initialStopId, initialStopName, showStopDropdown]);

  // Filter stops based on search text
  useEffect(() => {
    if (stopSearchText) {
      const filtered = stops.filter(stop => 
        stop.stop_id.toString().includes(stopSearchText) ||
        stop.stop_name.toLowerCase().includes(stopSearchText.toLowerCase())
      );
      setFilteredStops(filtered);
    } else {
      setFilteredStops(stops);
    }
  }, [stopSearchText, stops]);

  const handleStopSelect = (stop: Stop) => {
    onStopSelect(stop.stop_id.toString(), stop.stop_name);
    setSelectedStopName(`${stop.stop_id.toString()} - ${stop.stop_name}`);
    setStopSearchText('');
    setShowStopDropdown(false);
  };

  const renderStopItem = ({ item }: { item: Stop }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => handleStopSelect(item)}
    >
      <Text style={styles.dropdownItemText}>
         {item.stop_id} - {item.stop_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.autocompleteContainer}>
        <TouchableOpacity 
          style={[
            styles.input, 
            (!routeId || disabled) && styles.disabledInput
          ]}
          onPress={() => {
            if (routeId && !disabled) {
              setShowStopDropdown(true);
            } else if (!routeId) {
              Alert.alert('Select Route First', 'Please select a route before choosing a stop.');
            }
          }}
          disabled={!routeId || disabled || stopsLoading}
        >
          {stopsLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={selectedStopName ? styles.inputText : styles.placeholderText}>
              {selectedStopName || "Select a stop"}
            </Text>
          )}
          <Ionicons name="chevron-down" size={20} color={(!routeId || disabled) ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Stop Selection Modal */}
      <Modal
        visible={showStopDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStopDropdown(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Stop</Text>
              <TouchableOpacity onPress={() => setShowStopDropdown(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search stops by name or ID..."
              value={stopSearchText}
              onChangeText={setStopSearchText}
              autoCapitalize="none"
            />
            
            {stopsLoading ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
            ) : (
              <FlatList
                data={filteredStops}
                renderItem={renderStopItem}
                keyExtractor={(item) => item.stop_id.toString()}
                style={styles.dropdownList}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    {stops.length === 0 
                      ? "No stops available for this route." 
                      : "No stops found. Try a different search term."}
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

export default StopSelector;