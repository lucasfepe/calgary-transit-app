// components/map/components/MapControls.tsx
import React, { useState } from "react";
import { View, Button, Text, TouchableOpacity } from "react-native";
import { RadiusSelector } from "../RadiusSelector";
import { styles } from "../styles";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this package if not already
import { COLORS } from "@/constants";

interface Route {
  _id: string;
  route_short_name: string;
  route_long_name?: string;
}

interface MapControlsProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
  hasLocation: boolean;
  onFindRoutesNearMe: (radius: number) => Promise<Route[]>;
  onSelectRoute: (routeId: string) => void;
  controlsVisible?: boolean; // Optional prop to control visibility
  setControlsVisible?:  any// Optional prop to set visibility
}

export const MapControls: React.FC<MapControlsProps> = ({
  radius,
  onRadiusChange,
  isLoading,
  onRefresh,
  hasLocation,
  onFindRoutesNearMe,
  onSelectRoute,
  controlsVisible,
  setControlsVisible,
}) => {

  
  const [internalVisible, setInternalVisible] = useState(false);
  const effectiveVisible = controlsVisible ?? internalVisible;
  const setVisible = setControlsVisible ?? setInternalVisible;
  
  const toggleControls = () => {
    setVisible(!effectiveVisible);
  };
  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={toggleControls}
      >
        <Ionicons style={styles.menuButtonBurger} name={controlsVisible ? "close" : "menu"} size={24} color="black" />
      </TouchableOpacity>

      {/* Controls Panel - only visible when controlsVisible is true */}
      {controlsVisible && (
        <View style={styles.controlsPanel}>
          <RadiusSelector
            radius={radius}
            onRadiusChange={onRadiusChange}
            onFindRoutesNearMe={onFindRoutesNearMe}
            onSelectRoute={onSelectRoute}
            setControlsVisible={setControlsVisible}
          />
          <View style={styles.refreshButtonContainer}>
            <Button
              title={isLoading ? "Loading..." : "Refresh Data"}
              onPress={onRefresh}
              disabled={isLoading}
              color={COLORS.BLUE}
            />
            {!hasLocation && <Text style={styles.waitingText}>Waiting for location...</Text>}
          </View>
        </View>
      )}
    </>
  );
};