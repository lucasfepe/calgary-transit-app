// components/map/components/MapOverlays.tsx
import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

interface MapOverlaysProps {
  isLoading: boolean;
}

export const MapOverlays: React.FC<MapOverlaysProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <Text style={styles.loadingText}>Loading transit data...</Text>
    </View>
  );
};