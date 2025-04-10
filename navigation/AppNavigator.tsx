// navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../components/AuthScreen';
import MapScreen from '../components/map/MapScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen 
                name="Auth" 
                component={AuthScreen} 
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Map" 
                component={MapScreen}
                options={{ 
                    headerTitle: "Calgary Transit Map",
                    headerLeft: () => null // Prevents going back to auth screen
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;