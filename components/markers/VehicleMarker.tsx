// components/markers/VehicleMarker.tsx
import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Marker } from 'react-native-maps';
import { Vehicle } from '../../types/vehicles';
import { BusIcon, TrainIcon, HandicapBusIcon } from '../icons/TransitIcons';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons from Expo

interface VehicleMarkerProps {
    vehicle: Vehicle;
    onSelect: (vehicle: Vehicle) => void;
    isSelected: boolean;
    isOnSelectedRoute: boolean | undefined;
    isLoading?: boolean;
    isAnyVehicleLoading?: boolean;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = memo(({
    vehicle,
    onSelect,
    isSelected,
    isOnSelectedRoute,
    isLoading = false,
    isAnyVehicleLoading = false
}) => {
    // Add a key state to force re-render when selection changes
    const [renderKey, setRenderKey] = useState(0);

    // Keep track of whether the callout has been shown
    const [calloutShown, setCalloutShown] = useState(false);

    // Keep a ref to the marker with proper typing
    const markerRef = useRef<any | null>(null);

    // Track previous selection state
    const prevSelectedRef = useRef(isSelected);

    // Force a re-render when selection state changes
    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [isSelected, isOnSelectedRoute]);

    // Handle callout visibility based on selection state changes only
    useEffect(() => {
        // Only handle callout when selection state changes
        if (prevSelectedRef.current !== isSelected) {
            if (isSelected) {
                // When selected, show callout after a short delay
                const timer = setTimeout(() => {
                    if (markerRef.current) {
                        // Use optional chaining to safely access methods
                        markerRef.current?.showCallout?.();
                        setCalloutShown(true);
                    }
                }, 100);

                return () => clearTimeout(timer);
            } else if (calloutShown) {
                // When deselected, hide callout
                if (markerRef.current) {
                    // Use optional chaining to safely access methods
                    markerRef.current?.hideCallout?.();
                    setCalloutShown(false);
                }
            }

            // Update previous selection state
            prevSelectedRef.current = isSelected;
        }
    }, [isSelected, calloutShown]);

    // Keep callout visible during loading state changes
    useEffect(() => {
        // If selected and loading state changes, ensure callout stays visible
        if (isSelected && calloutShown && markerRef.current) {
            const timer = setTimeout(() => {
                if (markerRef.current) {
                    // Use optional chaining to safely access methods
                    markerRef.current?.showCallout?.();
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isLoading, isSelected, calloutShown]);

    // Create stable coordinate object
    const coordinate = useMemo(() => ({
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
    }), [vehicle.latitude, vehicle.longitude]);

    // Create stable title
    const markerTitle = useMemo(() =>
        vehicle.routeId ? `Route ${vehicle.routeId}` : 'Unknown Route',
        [vehicle.routeId]);

    // Determine color based on selection state - make this a stable value
    const color = useMemo(() => {
        if (isLoading) return '#FF3333';
        if (isAnyVehicleLoading && !isSelected) return '#FF9999';
        if (isSelected) return '#FF0000';
        if (isOnSelectedRoute === true) return '#FF0000';
        if (isOnSelectedRoute === false) return '#FF6666';
        return '#FF0000';
    }, [isLoading, isAnyVehicleLoading, isSelected, isOnSelectedRoute]);

    // Determine opacity - make this a stable value
    const opacity = useMemo(() => {
        if (isLoading) return 0.5;
        if (isAnyVehicleLoading && !isSelected) return 0.3;
        if (isSelected) return 1;
        if (isOnSelectedRoute === true) return 1;
        if (isOnSelectedRoute === false) return 0.5;
        return 0.8;
    }, [isLoading, isAnyVehicleLoading, isSelected, isOnSelectedRoute]);

    // Determine if we should show the selection outline - stable value
    const showSelectionOutline = useMemo(() => {
        return !isLoading && !isAnyVehicleLoading && (isSelected || isOnSelectedRoute === true);
    }, [isLoading, isAnyVehicleLoading, isSelected, isOnSelectedRoute]);

    // Get vehicle icon - memoize this
    const vehicleIcon = useMemo(() => {
        switch (vehicle.vehicleType) {
            case 'TRAIN':
                return <TrainIcon size={40} color={color} />;
            case 'HANDICAP_BUS':
                return <HandicapBusIcon size={40} color={color} />;
            default:
                return <BusIcon size={40} color={color} />;
        }
    }, [vehicle.vehicleType, color]);

    // Create stable style objects - Fix the TypeScript error
    const iconContainerStyle = useMemo(() => {
        // Create a base style object with the correct type
        const baseStyle: ViewStyle = {
            ...styles.iconContainer,
            opacity
        };

        // Add selection style if needed
        if (showSelectionOutline) {
            return {
                ...baseStyle,
                ...styles.selectedIconContainer
            };
        }

        return baseStyle;
    }, [opacity, showSelectionOutline]);

    // Stable onPress handler
    const handlePress = useMemo(() =>
        () => onSelect(vehicle),
        [onSelect, vehicle]);

    return (
        <Marker
            ref={markerRef}
            key={`vehicle-${vehicle.id}-${renderKey}`}
            identifier={`vehicle-${vehicle.id}`}
            coordinate={coordinate}
            title={markerTitle}
            onPress={handlePress}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={isSelected ? 1000 : 500}
            tracksViewChanges={false}
        >
            <View style={styles.markerContainer}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.indicatorBackground}>
                            {/* Using Ionicons hourglass */}
                            <Ionicons 
                                name="hourglass-outline" 
                                size={18} 
                                color="#FFFFFF" 
                                style={styles.hourglassIcon}
                            />
                        </View>
                    </View>
                )}

                {/* Vehicle icon with conditional white outline */}
                <View style={iconContainerStyle}>
                    {vehicleIcon}
                </View>
            </View>
        </Marker>
    );
}, (prevProps, nextProps) => {
    // We need to re-render when selection state changes
    if (
        prevProps.isSelected !== nextProps.isSelected ||
        prevProps.isOnSelectedRoute !== nextProps.isOnSelectedRoute ||
        prevProps.isLoading !== nextProps.isLoading ||
        prevProps.isAnyVehicleLoading !== nextProps.isAnyVehicleLoading
    ) {
        return false; // Return false to trigger re-render
    }

    // For other prop changes, use the existing comparison logic
    return (
        prevProps.vehicle.id === nextProps.vehicle.id &&
        prevProps.vehicle.latitude === nextProps.vehicle.latitude &&
        prevProps.vehicle.longitude === nextProps.vehicle.longitude
    );
});

// Updated styles
const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 80,
        width: 50,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    indicatorBackground: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hourglassIcon: {
        margin: 3
    },
    iconContainer: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
        padding: 0,
    },
    selectedIconContainer: {
        borderRadius: 5,
        backgroundColor: 'rgb(255, 255, 255)',
    }
});

export default VehicleMarker;