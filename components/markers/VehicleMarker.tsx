import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Marker } from 'react-native-maps';
import { Vehicle } from '../../types/vehicles';
import { BusIcon, TrainIcon, HandicapBusIcon } from '../icons/TransitIcons';

interface VehicleMarkerProps {
    vehicle: Vehicle;
    onSelect: (vehicle: Vehicle) => void;
    isSelected: boolean;
    isOnSelectedRoute: boolean | undefined;
    isLoading?: boolean;
    isAnyVehicleLoading?: boolean; // New prop to indicate if any vehicle is loading
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ 
    vehicle, 
    onSelect, 
    isSelected, 
    isOnSelectedRoute,
    isLoading = false,
    isAnyVehicleLoading = false
}) => {
    // Determine color based on selection state
    const getColor = () => {
        if (isLoading) return '#FF3333';
        if (isAnyVehicleLoading && !isSelected) return '#FF9999'; // Pale red for all non-selected vehicles when any is loading
        if (isSelected) return '#FF0000'; // Red for selected vehicle
        if (isOnSelectedRoute === true) return '#FF0000'; // Red for vehicles on the same route
        if (isOnSelectedRoute === false) return '#FF6666'; // Pale red for others when a route is selected
        return '#FF0000'; // Default red when no selection
    };

    // Determine opacity based on selection state
    const getOpacity = () => {
        if (isLoading) return 0.5;
        if (isAnyVehicleLoading && !isSelected) return 0.3; // Lower opacity for all non-selected vehicles when any is loading
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

    // Determine if we should show the selection outline
    // Now includes both selected vehicle AND vehicles on the selected route
    const showSelectionOutline = !isLoading && !isAnyVehicleLoading && (isSelected || isOnSelectedRoute === true);

    return (
        <Marker
            key={vehicle.id}
            coordinate={{
                latitude: vehicle.latitude,
                longitude: vehicle.longitude,
            }}
            title={markerTitle}
            onPress={() => onSelect(vehicle)}
            anchor={{ x: 0.5, y: 0.5 }}
        >
            <View style={styles.markerContainer}>
                {/* Loading indicator that appears above the vehicle icon */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.indicatorBackground}>
                            <ActivityIndicator 
                                size="small" 
                                color="#FFFFFF" 
                                style={styles.indicator}
                            />
                        </View>
                    </View>
                )}
                
                {/* Vehicle icon with conditional white outline */}
                <View 
                    style={[
                        styles.iconContainer, 
                        { opacity },
                        showSelectionOutline && styles.selectedIconContainer
                    ]}
                >
                    {getVehicleIcon()}
                </View>
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 80, // Increased height to accommodate both elements
        width: 50,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0, // Position at the top of the container
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2, // Ensure it's above the vehicle icon
    },
    indicatorBackground: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 0, 0, 0.7)', // Semi-transparent red background
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        margin: 3,
    },
    iconContainer: {
        position: 'absolute',
        bottom: 0, // Position at the bottom of the container
        zIndex: 1,
        padding: 3, // Add padding to make room for the outline
    },
    selectedIconContainer: {
        borderRadius: 5,
        backgroundColor: 'rgb(255, 255, 255)', 
    }
});

export default VehicleMarker;