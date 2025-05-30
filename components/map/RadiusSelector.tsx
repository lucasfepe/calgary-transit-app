// RadiusSelector.tsx
// Keep most of the code the same, but update the styles to fit better in the panel
import React, { useState } from 'react';
import { View, Button, Modal, FlatList, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { radStyles } from './styles';
import { Route } from '@/types';
import { COLORS } from '@/constants';

interface RadiusSelectorProps {
  radius: number;
  onRadiusChange: (value: number) => void;
  onFindRoutesNearMe: (radius: number) => Promise<Route[]>;
  onSelectRoute: (routeId: string) => void;
  setControlsVisible: (isVisible: boolean) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  radius,
  onRadiusChange,
  onFindRoutesNearMe,
  onSelectRoute,
  setControlsVisible
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nearbyRoutes, setNearbyRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindRoutesNearMe = async () => {
    setIsLoading(true);
    try {
      const routes = await onFindRoutesNearMe(radius);
      setNearbyRoutes(routes);
      setModalVisible(true);
    } catch (error) {
      console.error('Error finding nearby routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={radStyles.selectorContainer}>
      <Text style={radStyles.label}>Search Radius:</Text>
      <View style={radStyles.pickerContainer}>
        <Picker
          selectedValue={radius}
          style={radStyles.picker}
          onValueChange={(itemValue: number) => onRadiusChange(itemValue)}
        >
          <Picker.Item label="1 km" value={1} />
          <Picker.Item label="2 km" value={2} />
          <Picker.Item label="5 km" value={5} />
          <Picker.Item label="10 km" value={10} />
          <Picker.Item label="20 km" value={20} />
          <Picker.Item label="All" value={30} />
        </Picker>
      </View>

      <View style={radStyles.findRoutesButton}>
  <Button
    title={isLoading ? "Finding..." : "Find Routes Near Me"}
    onPress={handleFindRoutesNearMe}
    disabled={isLoading}
    color={COLORS.BLUE}
  />
</View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Modal content remains the same */}
        <View style={radStyles.modalContainer}>
          <View style={radStyles.modalContent}>
            <Text style={radStyles.modalTitle}>Nearby Routes</Text>
            
            {nearbyRoutes.length === 0 ? (
              <Text style={radStyles.noRoutesText}>No routes found nearby</Text>
            ) : (
              <FlatList
                data={nearbyRoutes}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={radStyles.routeItem}
                    onPress={() => {
                      onSelectRoute(item.route_short_name);
                      setModalVisible(false);
                      setControlsVisible(false); 
                    }}
                  >
                    <Text style={radStyles.routeName}>
                      Route {item.route_short_name}
                      {item.route_long_name ? ` - ${item.route_long_name}` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};