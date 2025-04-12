import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapClustering from 'react-native-map-clustering';
import { useLocation } from '../../hooks/useLocation';
import { useTransitData } from '../../hooks/useTransitData';
import VehicleMarker from '../markers/VehicleMarker';
import { RadiusSelector } from './RadiusSelector';
import { styles } from './styles';

// Add these constants at the top of the file
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Define interfaces for styles
interface ClusterStyles {
  clusterContainer: ViewStyle;
  clusterText: TextStyle;
}

// Create styles using StyleSheet.create
const clusterStyles = StyleSheet.create<ClusterStyles>({
  clusterContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center' as const, // Type assertion for FlexAlignType
    borderWidth: 2,
    borderColor: 'white',
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const MapScreen = () => {
  const { location, errorMsg: locationError } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const mapRef = useRef<MapView>(null);
  
  const { 
    filteredVehicles, 
    isLoading, 
    loadingProgress,
    error: transitError 
  } = useTransitData({
    location,
    radius,
  });

  return (
    <View style={styles.container}>
      <RadiusSelector radius={radius} onRadiusChange={setRadius} />
      
      {/* {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            Loading vehicles: {loadingProgress.toFixed(0)}%
          </Text>
        </View>
      )} */}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 51.0447,
          longitude: location?.coords.longitude || -114.0719,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description="Your current location"
            pinColor="blue"
          />
        )}
        
        {filteredVehicles.map((vehicle) => (
          <VehicleMarker key={vehicle.id} vehicle={vehicle} />
        ))}
      </MapView>

      {(locationError || transitError) && (
        <Text style={styles.errorText}>
          {locationError || transitError}
        </Text>
      )}
    </View>
  );
};

export default MapScreen;