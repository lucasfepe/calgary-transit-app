import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { clusterStyles } from '../styles';
import type { Cluster } from '../types';

interface ClusterViewProps {
  cluster: Cluster;
  isVehicleSelected: boolean;
}

export const ClusterView: React.FC<ClusterViewProps> = memo(({ cluster, isVehicleSelected }) => {
  // Memoize size and style values
  const size = useMemo(() => 30, []);
  const borderRadius = useMemo(() => size / 2, [size]);

  // Determine style based on selection state - make these stable values
  const backgroundColor = useMemo(() =>
    isVehicleSelected ? '#FF6666' : '#FF0000',
    [isVehicleSelected]);

  const opacity = useMemo(() =>
    isVehicleSelected ? 0.5 : 0.8,
    [isVehicleSelected]);

  // Create a stable style object
  const containerStyle = useMemo(() => [
    clusterStyles.clusterContainer,
    {
      width: size,
      height: size,
      borderRadius: borderRadius,
      backgroundColor,
      opacity,
    }
  ], [size, borderRadius, backgroundColor, opacity]);

  return (
    <View style={containerStyle}>
      <Text style={clusterStyles.clusterText}>
        {cluster.numPoints}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.cluster.id === nextProps.cluster.id &&
    prevProps.cluster.numPoints === nextProps.cluster.numPoints &&
    prevProps.isVehicleSelected === nextProps.isVehicleSelected
  );
});