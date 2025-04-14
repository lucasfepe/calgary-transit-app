// components/map/components/RouteShape.tsx
import React from 'react';
import { Polyline } from 'react-native-maps';

interface RouteShapeProps {
  coordinates: number[][][];
  routeId: string | undefined;
}

export const RouteShape: React.FC<RouteShapeProps> = ({ coordinates, routeId }) => {
  return (
    <>
      {coordinates.map((lineString, index) => (
        <Polyline
          key={`${routeId}-${index}`}
          coordinates={lineString.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng
          }))}
          strokeColor="#FF0000"
          strokeWidth={4}
          lineDashPattern={[1]}
          zIndex={1}
        />
      ))}
    </>
  );
};