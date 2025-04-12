import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useTransitData } from '../../hooks/useTransitData';
import { RadiusSelector } from './RadiusSelector';
import { styles } from './styles';
import { useMapClustering } from './hooks/useMapClustering';
import { ClusterMarkers } from './components/ClusterMarkers';
import { UserLocationMarker } from './components/UserLocationMarker';
import { ErrorDisplay } from './components/ErrorDisplay';
import { MAP_CONSTANTS } from './constants';
import type { Region } from './types';

const MapScreen = () => {
  const { location, errorMsg: locationError } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const [region, setRegion] = useState<Region>(MAP_CONSTANTS.initialRegion(location));
  const mapRef = useRef<MapView>(null);
  
  const { 
    filteredVehicles, 
    isLoading, 
    error: transitError,
    refreshData 
  } = useTransitData({ location, radius });

  const clusters = useMapClustering(filteredVehicles, region);

  return (
    <View style={styles.container}>
      <RadiusSelector radius={radius} onRadiusChange={setRadius} />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChange={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        <UserLocationMarker location={location} />
        <ClusterMarkers clusters={clusters} />
      </MapView>

      <ErrorDisplay 
        locationError={locationError} 
        transitError={transitError} 
      />
    </View>
  );
};

export default MapScreen;