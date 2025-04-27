// AppEntry.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

const AppEntry = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Small delay to ensure all modules initialize
    const timer = setTimeout(() => {
      try {
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'red', marginBottom: 10 }}>Failed to initialize app</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Starting app...</Text>
      </View>
    );
  }

  return <App />;
};

// Register this component as the entry point
registerRootComponent(AppEntry);

export default AppEntry;