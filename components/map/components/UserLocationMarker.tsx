// components/map/components/UserLocationMarker.tsx
import React from 'react';
import { Marker } from 'react-native-maps';
import { LocationObject } from 'expo-location';
import { COLORS } from '@/constants';

interface UserLocationMarkerProps {
  location: LocationObject | null;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ location }) => {
  if (!location) return null;

  return (
    <Marker
      coordinate={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }}
      title="You are here"
      description="Your current location"
      pinColor={COLORS.BLUE}
    />
  );
};