import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Marker } from 'react-native-maps';
import { Vehicle } from '../../types/vehicles';
import { BusIcon, TrainIcon, HandicapBusIcon } from '../icons/TransitIcons';

interface VehicleMarkerProps {
    vehicle: Vehicle;
    onSelect: (vehicle: Vehicle) => void;
    isSelected: boolean;
    isOnSelectedRoute: boolean | undefined;
    isLoading?: boolean;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ 
    vehicle, 
    onSelect, 
    isSelected, 
    isOnSelectedRoute,
    isLoading = false
}) => {
    // Create a rotation animation
    const spinValue = React.useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
        // Start the rotation animation when component mounts
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);
    
    // Map 0-1 to 0-360 degrees
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

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
            // style={styles.markerParent}
        >
            {isLoading ? ( // Change to isLoading in production
                <View style={styles.loadingMarker}>
                    {/* Custom spinning indicator */}
                    <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                        <View style={styles.spinnerRing} />
                    </Animated.View>
                </View>
            ) : (
                <View style={{ opacity }}>
                    {getVehicleIcon()}
                </View>
            )}
        </Marker>
    );
};

const styles = StyleSheet.create({
    markerParent: {
 
       width:80,
       height:80
    },
    
    loadingMarker: {
        width: 50,  // Increased size to provide more space
        height: 50, // Increased size to provide more space
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        borderRadius: 25, // Half of width/height
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5, // Add padding to prevent clipping
        overflow: 'visible', // Allow content to overflow
    },
    spinnerContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible', // Allow content to overflow
    },
    spinnerRing: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderTopColor: '#FFFFFF',
        borderRightColor: 'rgba(255, 255, 255, 0.6)',
    }
});

export default VehicleMarker;