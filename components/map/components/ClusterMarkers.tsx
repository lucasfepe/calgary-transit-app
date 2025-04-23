// components/map/components/ClusterMarkers.tsx
import React, { memo, useMemo } from 'react';
import { Marker } from 'react-native-maps';
import VehicleMarker from '../../markers/VehicleMarker';
import { ClusterView } from './ClusterView';
import type { Cluster } from '../types';
import { Vehicle } from '@/types/vehicles';

interface ClusterMarkersProps {
  clusters: Cluster[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicle: Vehicle | null;
  activeRouteId: string | undefined | null;
  isLoadingRoute: boolean;
}

export const ClusterMarkers: React.FC<ClusterMarkersProps> = memo(({
  clusters,
  onVehicleSelect,
  selectedVehicle,
  activeRouteId,
  isLoadingRoute
}) => {
  // Create stable references for primitive values
  const selectedId = useMemo(() => selectedVehicle?.id || null, [selectedVehicle]);
  const isLoading = useMemo(() => !!isLoadingRoute, [isLoadingRoute]);
  const activeRoute = useMemo(() => activeRouteId || null, [activeRouteId]);

  // Determine if any vehicle is selected
  const isVehicleSelected = useMemo(() => selectedVehicle !== null, [selectedVehicle]);

  // Memoize the markers to prevent unnecessary re-renders
  const renderedMarkers = useMemo(() => {
    console.log('[ClusterMarkers] Recalculating markers, selectedId:', selectedId);

    return clusters.map(cluster => {
      if (cluster.numPoints === 1) {
        const vehicle = cluster.points[0].vehicle;
        // Create stable props for each vehicle marker
        const key = `vehicle-${vehicle.id}`;
        const isThisSelected = selectedId === vehicle.id;

        console.log(`Vehicle ${vehicle.id} isSelected:`, isThisSelected);

        const isOnRoute = activeRoute ? vehicle.routeId === activeRoute : undefined;
        const isThisLoading = isLoading && isThisSelected;

        return (
          <VehicleMarker
            key={key}
            vehicle={vehicle}
            onSelect={onVehicleSelect}
            isSelected={isThisSelected}
            isOnSelectedRoute={isOnRoute}
            isLoading={isThisLoading}
            isAnyVehicleLoading={isLoading}
          />
        );
      } else {
        // Create a stable coordinate object for the cluster
        const coordinate = {
          latitude: cluster.coordinate.latitude,
          longitude: cluster.coordinate.longitude,
        };

        return (
          <Marker
            key={`cluster-${cluster.id}`}
            identifier={`cluster-${cluster.id}`}
            coordinate={coordinate}
            zIndex={400} // Lower than individual vehicles
            tracksViewChanges={false} // Add this to prevent blinking
          >
            <ClusterView
              cluster={cluster}
              isVehicleSelected={isVehicleSelected}
            />
          </Marker>
        );
      }
    });
  }, [clusters, onVehicleSelect, selectedId, activeRoute, isLoading, isVehicleSelected]);

  return <>{renderedMarkers}</>;
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  return (
    prevProps.clusters === nextProps.clusters &&
    prevProps.selectedVehicle?.id === nextProps.selectedVehicle?.id &&
    prevProps.activeRouteId === nextProps.activeRouteId &&
    prevProps.isLoadingRoute === nextProps.isLoadingRoute
  );
});