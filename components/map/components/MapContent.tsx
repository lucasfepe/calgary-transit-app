// components/map/components/MapContent.tsx
import React from "react";
import { RouteShape } from "./RouteShape";
import { StopMarkers } from "./StopMarkers";
import { UserLocationMarker } from "./UserLocationMarker";
import { ClusterMarkers } from "./ClusterMarkers";
import { useMapState } from "../hooks/useMapState"; 

interface MapContentProps {
  mapState: ReturnType<typeof useMapState>;
}

export const MapContent: React.FC<MapContentProps> = ({ mapState }) => {
  const {
    routeShape,
    activeRouteId,
    routeStops,
    routeLongName,
    effectiveLocation,
    clusters,
    handleVehicleSelect,
    selectedVehicle,
    isLoadingRoute
  } = mapState;

  return (
    <>
      {routeShape && activeRouteId && (
        <RouteShape
          coordinates={routeShape}
          routeId={activeRouteId}
        />
      )}
      {routeStops && activeRouteId &&(
        <StopMarkers stops={routeStops} routeId={activeRouteId} routeDisplayText={routeLongName ?? undefined}/>
      )}
      {effectiveLocation && <UserLocationMarker location={effectiveLocation} />}
      <ClusterMarkers
        onVehicleSelect={handleVehicleSelect}
        clusters={clusters}
        selectedVehicle={selectedVehicle}
        activeRouteId={activeRouteId}
        isLoadingRoute={isLoadingRoute}
      />
    </>
  );
};