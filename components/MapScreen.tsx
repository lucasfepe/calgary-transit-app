// import React, { useState, useEffect } from "react";
// import { StyleSheet, View, Alert, Text } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";
// import GtfsRealtimeBindings from "gtfs-realtime-bindings";
// import { Vehicle } from "../types/vehicles";
// import { determineVehicleType } from "../utils/vehicleUtils";
// import VehicleMarker from "./markers/VehicleMarker";
// import { Picker } from "@react-native-picker/picker";

// const MapScreen = () => {
//   const [location, setLocation] = useState<Location.LocationObject | null>(
//     null
//   );
//   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [radius, setRadius] = useState<number>(5); // Default 5 miles radius

//   // Function to calculate distance between two points using Haversine formula
//   const calculateDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
//   ) => {
//     const R = 3963.19; // Earth's radius in miles
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   // Filter vehicles based on radius
//   const getFilteredVehicles = () => {
//     if (!location) return vehicles;

//     return vehicles.filter((vehicle) => {
//       const distance = calculateDistance(
//         location.coords.latitude,
//         location.coords.longitude,
//         vehicle.latitude,
//         vehicle.longitude
//       );
//       return distance <= radius;
//     });
//   };
//   useEffect(() => {
//     (async () => {
//       try {
//         console.log("Requesting location permission...");
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         console.log("Location permission status:", status);

//         if (status !== "granted") {
//           setErrorMsg("Permission to access location was denied");
//           Alert.alert(
//             "Location Permission Denied",
//             "Please enable location services to see your position on the map."
//           );
//           return;
//         }

//         console.log("Getting current location...");
//         let currentLocation = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//         });
//         console.log("Current location:", currentLocation);
//         setLocation(currentLocation);

//         const locationSubscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 5000,
//             distanceInterval: 5,
//           },
//           (newLocation) => {
//             console.log("Location updated:", newLocation);
//             setLocation(newLocation);
//           }
//         );

//         return () => {
//           if (locationSubscription) {
//             locationSubscription.remove();
//           }
//         };
//       } catch (error) {
//         console.error("Error getting location:", error);
//         setErrorMsg("Error getting location");
//         Alert.alert("Location Error", "Failed to get your current location.");
//       }
//     })();

//     fetchRealTimeData();
//     const interval = setInterval(fetchRealTimeData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchRealTimeData = async () => {
//     try {
//       const response = await axios({
//         method: "get",
//         url: "https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream",
//         responseType: "arraybuffer",
//       });

//       const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
//         new Uint8Array(response.data)
//       );
//       const vehicleData = feed.entity
//         .filter(
//           (entity) =>
//             entity.vehicle && entity.vehicle.vehicle && entity.vehicle.position
//         )
//         .map((entity) => {
//           const vehicle = entity.vehicle!;
//           return {
//             id: vehicle.vehicle!.id || "unknown",
//             latitude: vehicle.position!.latitude,
//             longitude: vehicle.position!.longitude,
//             routeId: vehicle.trip?.routeId || "N/A",
//             label: vehicle.vehicle!.label || "N/A",
//             speed: vehicle.position!.speed || 0,
//             vehicleType: determineVehicleType(vehicle),
//           };
//         });
//       setVehicles(vehicleData);
//     } catch (error) {
//       console.error("Error fetching GTFS Realtime data:", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={radius}
//           style={styles.picker}
//           onValueChange={(itemValue: number) => setRadius(itemValue)}
//         >
//           <Picker.Item label="1 mile" value={1} />
//           <Picker.Item label="2 miles" value={2} />
//           <Picker.Item label="5 miles" value={5} />
//           <Picker.Item label="10 miles" value={10} />
//           <Picker.Item label="20 miles" value={20} />
//           <Picker.Item label="All" value={999999} />
//         </Picker>
//       </View>

//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           latitude: location?.coords.latitude || 51.0447,
//           longitude: location?.coords.longitude || -114.0719,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//         showsUserLocation={true}
//         showsMyLocationButton={true}
//         showsCompass={true}
//       >
//         {location && (
//           <Marker
//             coordinate={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             }}
//             title="You are here"
//             description="Your current location"
//             pinColor="blue"
//           />
//         )}

//         {getFilteredVehicles().map((vehicle) => (
//           <VehicleMarker key={vehicle.id} vehicle={vehicle} />
//         ))}
//       </MapView>
//       {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: "100%",
//     height: "100%",
//   },
//   errorText: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: "rgba(255, 0, 0, 0.7)",
//     padding: 10,
//     color: "white",
//     borderRadius: 5,
//   },
//   pickerContainer: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     zIndex: 1,
//     backgroundColor: "white",
//     borderRadius: 5,
//     width: 150,
//   },
//   picker: {
//     height: 40,
//     width: 150,
//   },
// });

// export default MapScreen;
