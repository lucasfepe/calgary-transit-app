import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Vehicle } from '../../types/vehicles';
import { BusIcon, TrainIcon, HandicapBusIcon } from '../icons/TransitIcons';

interface VehicleMarkerProps {
    vehicle: Vehicle;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ vehicle }) => {
    const getVehicleIcon = () => {
        switch (vehicle.vehicleType) {
            case 'TRAIN':
                return <TrainIcon size={40} />;
            case 'HANDICAP_BUS':
                return <HandicapBusIcon size={40} />;
            default:
                return <BusIcon size={40} />;
        }
    };

    return (
        <Marker
            key={vehicle.id}
            coordinate={{
                latitude: vehicle.latitude,
                longitude: vehicle.longitude,
            }}
            title={`Route ${vehicle.id}`}
            
        >
            <View>
                {getVehicleIcon()}
            </View>
        </Marker>
    );
};

export default VehicleMarker;