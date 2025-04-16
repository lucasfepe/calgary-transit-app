// components/map/components/ClusterView.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { clusterStyles } from '../styles';
import type { Cluster } from '../types';

interface ClusterViewProps {
  cluster: Cluster;
  isVehicleSelected: boolean; // Add this prop
}

export const ClusterView: React.FC<ClusterViewProps> = ({ cluster, isVehicleSelected }) => {
  // const size = Math.min(40 + (cluster.numPoints * 3), 70);
  const size = 30;
  const borderRadius = size / 2;
  
  // Determine style based on selection state
  const backgroundColor = isVehicleSelected ? '#FF6666' : '#FF0000';
  const opacity = isVehicleSelected ? 0.5 : 0.8;

  return (
    <View style={[
      clusterStyles.clusterContainer,
      {
        width: size,
        height: size,
        borderRadius: borderRadius,
        backgroundColor, // Apply dynamic background color
        opacity, // Apply dynamic opacity
        // Add these to ensure proper centering
        // position: 'relative',
        // left: -size / 2,
        // top: -size / 2,
      }
    ]}>
      <Text style={clusterStyles.clusterText}>
        {cluster.numPoints}
      </Text>
    </View>
  );
};