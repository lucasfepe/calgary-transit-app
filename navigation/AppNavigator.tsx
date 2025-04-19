// navigation/AppNavigator.tsx (with bottom tabs)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/authContext';
import AuthScreen from '../components/AuthScreen';
import MapScreen from '../components/map/MapScreen';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SubscriptionScreen from '@/components/subscriptions/SubscriptionScreen';
import AddSubscriptionScreen from '@/components/subscriptions/AddSubscriptionScreen';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define the types for our navigators
type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  AdminDashboard: undefined;
  AddSubscription: undefined;
};

type MainTabParamList = {
  Subscriptions: undefined;
  Map: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Remove headers for all tab screens
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Subscriptions') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Subscriptions" 
        component={SubscriptionScreen} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Remove headers for all stack screens
      }}
    >
      {!isAuthenticated ? (
        // User is not authenticated, show auth screen
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
        />
      ) : (
        // User is authenticated, show app screens
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator} 
          />
          
          <Stack.Screen 
            name="AddSubscription" 
            component={AddSubscriptionScreen}
          />
          
          {/* Only show admin dashboard if user is an admin */}
          {isAdmin && (
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboard}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;