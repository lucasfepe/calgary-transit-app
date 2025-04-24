// components/map/components/MapContent.tsx
import React, { memo, useEffect, useRef } from "react";
import { RouteShape } from "./RouteShape";
import { StopMarkers } from "./StopMarkers";
import { UserLocationMarker } from "./UserLocationMarker";
import { ClusterMarkers } from "./ClusterMarkers";
import { useMapState } from "../hooks/useMapState";

interface MapContentProps {
  mapState: ReturnType<typeof useMapState>;
}

export const MapContent: React.FC<MapContentProps> = memo(({ mapState }) => {
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current++;
  });
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
      {routeStops && activeRouteId && (
        <StopMarkers stops={routeStops} routeId={activeRouteId} routeDisplayText={routeLongName ?? undefined} />
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
}, (prevProps, nextProps) => {
  // Only re-render if these specific parts of mapState change
  const prevState = prevProps.mapState;
  const nextState = nextProps.mapState;

  const areEqual = (
    prevState.routeShape === nextState.routeShape &&
    prevState.activeRouteId === nextState.activeRouteId &&
    prevState.routeStops === nextState.routeStops &&
    prevState.effectiveLocation === nextState.effectiveLocation &&
    prevState.clusters === nextState.clusters &&
    prevState.selectedVehicle?.id === nextState.selectedVehicle?.id &&
    prevState.isLoadingRoute === nextState.isLoadingRoute
  );




  return areEqual;
});