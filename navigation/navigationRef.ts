// navigation/navigationRef.ts
import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: any) {
    if (navigationRef.current) {
        navigationRef.current.navigate(name, params);
    } else {
        // Navigation wasn't ready
        console.warn('Cannot navigate, navigation ref not set');
    }
}