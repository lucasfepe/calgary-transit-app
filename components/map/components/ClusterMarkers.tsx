// components/map/components/ClusterMarkers.tsx
import React from 'react';
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

export const ClusterMarkers: React.FC<ClusterMarkersProps> = ({ 
  clusters, 
  onVehicleSelect, 
  selectedVehicle, 
  activeRouteId,
  isLoadingRoute 
}) => {
  // Determine if any vehicle is selected
  const isVehicleSelected = selectedVehicle !== null;

  return (
    <>
      {clusters.map(cluster => (
        cluster.numPoints === 1 ? (
          <VehicleMarker 
            key={cluster.points[0].vehicle.id} 
            vehicle={cluster.points[0].vehicle} 
            onSelect={onVehicleSelect}
            isSelected={selectedVehicle?.id === cluster.points[0].vehicle.id}
            isOnSelectedRoute={activeRouteId ? cluster.points[0].vehicle.routeId === activeRouteId : undefined}
            isLoading={isLoadingRoute && selectedVehicle?.id === cluster.points[0].vehicle.id}
            isAnyVehicleLoading={isLoadingRoute}
          />
        ) : (
          <Marker key={cluster.id} coordinate={cluster.coordinate}>
            <ClusterView 
              cluster={cluster} 
              isVehicleSelected={isVehicleSelected} 
            />
          </Marker>
        )
      ))}
    </>
  );
};