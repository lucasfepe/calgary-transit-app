// hooks/useLocation.ts - Improved version
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Function to manually refresh location
  const refreshLocation = useCallback(async () => {
    try {
      console.log("Manually refreshing location...");
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log("Got refreshed location:", 
        currentLocation.coords.latitude.toFixed(6),
        currentLocation.coords.longitude.toFixed(6)
      );
      setLocation(currentLocation);
      return true;
    } catch (error) {
      console.error("Error refreshing location:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        console.log("Requesting location permissions...");
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.log("Location permission denied");
          setErrorMsg('Permission to access location was denied');
          Alert.alert(
            'Location Permission Denied',
            'Please enable location services to see your position on the map.'
          );
          return;
        }
        
        console.log("Location permission granted, getting current position...");
        
        // First get current position
        try {
          let currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          if (isMounted) {
            console.log("Initial location obtained:", 
              currentLocation.coords.latitude.toFixed(6),
              currentLocation.coords.longitude.toFixed(6)
            );
            setLocation(currentLocation);
          }
        } catch (positionError) {
          console.error("Error getting initial position:", positionError);
          // Continue anyway to set up the subscription
        }

        // Then set up continuous tracking
        console.log("Setting up location subscription...");
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced, // Balanced is often sufficient and uses less battery
            timeInterval: 10000, // 10 seconds
            distanceInterval: 10, // 10 meters
          },
          (newLocation) => {
            if (isMounted) {
              console.log("Location update from subscription:", 
                newLocation.coords.latitude.toFixed(6),
                newLocation.coords.longitude.toFixed(6)
              );
              setLocation(newLocation);
            }
          }
        );
        
        console.log("Location subscription set up successfully");
      } catch (error) {
        console.error("Error in location setup:", error);
        if (isMounted) {
          setErrorMsg('Error getting location');
          Alert.alert('Location Error', 'Failed to get your current location.');
        }
      }
    })();

    // Cleanup function
    return () => {
      console.log("Cleaning up location subscription");
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []);

  return { location, errorMsg, refreshLocation };
};