import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          Alert.alert(
            'Location Permission Denied',
            'Please enable location services to see your position on the map.'
          );
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
        });
        setLocation(currentLocation);

        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          setLocation
        );

        return () => {
          locationSubscription.remove();
        };
      } catch (error) {
        setErrorMsg('Error getting location');
        Alert.alert('Location Error', 'Failed to get your current location.');
      }
    })();
  }, []);

  return { location, errorMsg };
};