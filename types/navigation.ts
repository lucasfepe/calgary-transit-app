// types/navigation.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Subscriptions: undefined;
  AddSubscription: {
    routeId?: string;
    routeDisplayText?: string;
    stopId?: string;
    stopName?: string;
  };
  Map: undefined;
  // Add all your other screens here
  Auth: undefined;
  Admin: undefined;
  // ... etc.
};

// Helper types for navigation props
export type ScreenNavigationProp<T extends keyof RootStackParamList> = 
  StackNavigationProp<RootStackParamList, T>;

export type ScreenRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

// Common hook return type
export type NavigationHookType = StackNavigationProp<RootStackParamList>;