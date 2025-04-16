// VehicleMarker.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Vehicle } from '../../types/vehicles';
import { BusIcon, TrainIcon, HandicapBusIcon } from '../icons/TransitIcons';

interface VehicleMarkerProps {
    vehicle: Vehicle;
    onSelect: (vehicle: Vehicle) => void;
    isSelected: boolean;
    isOnSelectedRoute: boolean | undefined;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ 
    vehicle, 
    onSelect, 
    isSelected, 
    isOnSelectedRoute 
}) => {
    // Determine color based on selection state
    const getColor = () => {
        if (isSelected) return '#FF0000'; // Red for selected vehicle
        if (isOnSelectedRoute === true) return '#FF0000'; // Red for vehicles on the same route
        if (isOnSelectedRoute === false) return '#FF6666'; // Pale red for others when a route is selected
        return '#FF0000'; // Default red when no selection
    };

    // Determine opacity based on selection state
    const getOpacity = () => {
        if (isSelected) return 1; // Full opacity for selected vehicle
        if (isOnSelectedRoute === true) return 1; // Full opacity for vehicles on the same route
        if (isOnSelectedRoute === false) return 0.5; // Half opacity for others when a route is selected
        return 0.8; // Slightly transparent when no selection
    };

    const getVehicleIcon = () => {
        const color = getColor();
        switch (vehicle.vehicleType) {
            case 'TRAIN':
                return <TrainIcon size={40} color={color} />;
            case 'HANDICAP_BUS':
                return <HandicapBusIcon size={40} color={color} />;
            default:
                return <BusIcon size={40} color={color} />;
        }
    };

    const markerTitle = vehicle.routeId 
        ? `Route ${vehicle.routeId}`
        : 'Unknown Route';

    const opacity = getOpacity();

    return (
        <Marker
            key={vehicle.id}
            coordinate={{
                latitude: vehicle.latitude,
                longitude: vehicle.longitude,
            }}
            title={markerTitle}
            onPress={() => onSelect(vehicle)}
        >
            <View style={{ opacity }}>
                {getVehicleIcon()}
            </View>
        </Marker>
    );
};

export default VehicleMarker;