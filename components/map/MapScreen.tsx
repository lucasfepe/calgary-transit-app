import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useTransitData } from '../../hooks/useTransitData';
import VehicleMarker from '../markers/VehicleMarker';
import { RadiusSelector } from './RadiusSelector';
import { styles } from './styles';

const MapScreen = () => {
  const { location, errorMsg: locationError } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  
  const { 
    filteredVehicles, 
    isLoading, 
    error: transitError 
  } = useTransitData({
    location,
    radius,
  });

  return (
    <View style={styles.container}>
      <RadiusSelector radius={radius} onRadiusChange={setRadius} />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

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