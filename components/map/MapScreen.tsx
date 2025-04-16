import React, { useState, useRef, useEffect } from "react";
import { View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "../../hooks/useLocation";
import { useTransitData } from "../../hooks/useTransitData";
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
import { tripMappingService } from "@/services/transit/tripMappingService";
import { StopMarkers } from "./components/StopMarkers";
import { Stop } from "@/types/map";

const MapScreen = () => {
  const { location, errorMsg: locationError } = useLocation();
  const [radius, setRadius] = useState<number>(1);
  const [region, setRegion] = useState<Region>(
    MAP_CONSTANTS.initialRegion(location)
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [routeShape, setRouteShape] = useState<number[][][] | null>(null);
  const [routeStops, setRouteStops] = useState<Stop[] | null>(null);

  const mapRef = useRef<MapView>(null);

  const {
    filteredVehicles,
    isLoading,
    error: transitError,
    mappingError,
    refreshData,
  } = useTransitData({ location, radius });

  const clusters = useMapClustering(filteredVehicles, region);

  const clearSelection = () => {
    setSelectedVehicle(null);
    setRouteShape(null);
    setRouteStops(null);
  };

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    try {
      const routeId = tripMappingService.getRouteForTrip(vehicle.tripId);
      vehicle.routeId = routeId ? routeId : undefined;
      setSelectedVehicle(vehicle);
      if (!routeId) {
        setRouteShape(null);
        setRouteStops(null);
        return;
      }

      const routeData = tripMappingService.getRouteData(routeId);
      if (routeData) {
        if (routeData.shape) {
          setRouteShape(routeData.shape);
        }
        console.log("routeData.stops:", routeData.stops);
        if (routeData.stops) {
          setRouteStops(routeData.stops);
        }
      }
    } catch (error) {
      console.error("Error fetching route shape:", error);
    }
  };

  useEffect(() => {
    if (mappingError) {
      console.warn("Mapping service error:", mappingError);
      // Maybe show a non-intrusive warning to the user
    }
  }, [mappingError]);

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
        {routeShape && selectedVehicle && (
          <RouteShape
            coordinates={routeShape}
            routeId={selectedVehicle.routeId}
          />
        )}
        {routeStops && selectedVehicle && (
          <StopMarkers stops={routeStops} routeId={selectedVehicle.routeId} />
        )}
        <UserLocationMarker location={location} />
        <ClusterMarkers
          onVehicleSelect={handleVehicleSelect}
          clusters={clusters}
        />
      </MapView>

      <ErrorDisplay locationError={locationError} transitError={transitError} />
    </View>
  );
};

export default MapScreen;
