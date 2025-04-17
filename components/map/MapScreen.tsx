// MapScreen.tsx
import React, { useState, useRef } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "../../hooks/useLocation";
import { useTransitData } from "../../hooks/useTransitData";
import { useRouteData } from "../../hooks/useRouteData"; // New hook
import { RadiusSelector } from "./RadiusSelector";
import { styles } from "./styles";
import { useMapClustering } from "./hooks/useMapClustering";
import { ClusterMarkers } from "./components/ClusterMarkers";
import { UserLocationMarker } from "./components/UserLocationMarker";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { MAP_CONSTANTS } from "./constants";
import type { Region } from "./types";
import { RouteShape } from "./components/RouteShape";
import { Vehicle } from "@/types/vehicles";
import { StopMarkers } from "./components/StopMarkers";

const MapScreen = () => {
  const { location, errorMsg: locationError } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const [region, setRegion] = useState<Region>(
    MAP_CONSTANTS.initialRegion(location)
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  const mapRef = useRef<MapView>(null);

  const {
    filteredVehicles,
    isLoading,
    error: transitError,
    mappingError,
    refreshData,
  } = useTransitData({ location, radius });

  const {
    activeRouteId,
    routeShape,
    routeStops,
    loadRouteData,
    clearRouteData
  } = useRouteData();

  const clusters = useMapClustering(filteredVehicles, region);

  const clearSelection = () => {
    setSelectedVehicle(null);
    clearRouteData();
    setIsLoadingRoute(false);
  };

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsLoadingRoute(true);
    try {
      await loadRouteData(vehicle.routeId);
    } finally {
      setIsLoadingRoute(false);
    }
  };

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
        onPress={clearSelection}
      >
        {routeShape && activeRouteId && (
          <RouteShape
            coordinates={routeShape}
            routeId={activeRouteId}
          />
        )}
        {routeStops && activeRouteId && (
          <StopMarkers stops={routeStops} routeId={activeRouteId} />
        )}
        <UserLocationMarker location={location} />
        <ClusterMarkers
          onVehicleSelect={handleVehicleSelect}
          clusters={clusters}
          selectedVehicle={selectedVehicle}
          activeRouteId={activeRouteId}
          isLoadingRoute={isLoadingRoute}
        />
      </MapView>

      <ErrorDisplay locationError={locationError} transitError={transitError} />
    </View>
  );
};

export default MapScreen;