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
}

export const ClusterMarkers: React.FC<ClusterMarkersProps> = ({ clusters, onVehicleSelect }) => {
  return (
    <>
      {clusters.map(cluster => (
        cluster.numPoints === 1 ? (
          <VehicleMarker 
            key={cluster.points[0].vehicle.id} 
            vehicle={cluster.points[0].vehicle} 
            onSelect={onVehicleSelect}
          />
        ) : (
          <Marker key={cluster.id} coordinate={cluster.coordinate}>
            <ClusterView cluster={cluster} />
          </Marker>
        )
      ))}
    </>
  );
};