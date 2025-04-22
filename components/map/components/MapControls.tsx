// components/map/components/MapControls.tsx
import React, { useState } from "react";
import { View, Button, Text, TouchableOpacity } from "react-native";
import { RadiusSelector } from "../RadiusSelector";
import { styles } from "../styles";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this package if not already

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
}

export const MapControls: React.FC<MapControlsProps> = ({
  radius,
  onRadiusChange,
  isLoading,
  onRefresh,
  hasLocation,
  onFindRoutesNearMe,
  onSelectRoute
}) => {
  const [controlsVisible, setControlsVisible] = useState(false);

  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
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
          />
          
        </View>
      )}
    </>
  );
};