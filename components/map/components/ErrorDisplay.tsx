// components/map/components/ErrorDisplay.tsx
import React from 'react';
import { Text } from 'react-native';
import { styles } from '../styles';

interface ErrorDisplayProps {
  locationError: string | null | undefined;
  transitError?: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  locationError, 
  transitError 
}) => {
  if (!locationError && !transitError) return null;
  
  return (
    <Text style={styles.errorText}>
      {locationError || transitError}
    </Text>
  );
};