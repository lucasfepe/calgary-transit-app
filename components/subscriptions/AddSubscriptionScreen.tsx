// components/subscriptions/AddSubscriptionScreen.tsx (updated)
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createSubscription } from '@/services/subscriptions/subscriptionService';
import { TimeRange } from '@/types/subscription';
import { styles } from './styles/addSubscriptionStyles';
import RouteSelector from './components/RouteSelector';
import StopSelector from './components/StopSelector';
import DaySelector from './components/DaySelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import FormButtons from './components/FormButtons';

const AddSubscriptionScreen = () => {
  const navigation = useNavigation();
  const [routeId, setRouteId] = useState('');
  const [routeDisplayText, setRouteDisplayText] = useState('');
  const [stopId, setStopId] = useState('');
  const [stopName, setStopName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRouteSelect = (id: string, displayText: string) => {
    setRouteId(id);
    setRouteDisplayText(displayText);
    // Clear the stop selection when route changes
    setStopId('');
    setStopName('');
  };

  const handleStopSelect = (id: string, name: string) => {
    setStopId(id);
    setStopName(name);
  };

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startTime;
    setShowStartPicker(Platform.OS === 'ios');
    setStartTime(currentDate);
    
    // If end time is before start time, adjust it
    if (currentDate > endTime) {
      const newEndTime = new Date(currentDate);
      newEndTime.setHours(newEndTime.getHours() + 1);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endTime;
    setShowEndPicker(Platform.OS === 'ios');
    setEndTime(currentDate);
  };

  const validateForm = () => {
    if (!routeId.trim()) {
      Alert.alert('Error', 'Please select a route');
      return false;
    }
    if (!stopId.trim()) {
      Alert.alert('Error', 'Please select a stop');
      return false;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week');
      return false;
    }
    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const timeRange: TimeRange = {
        weekdays: selectedDays,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };

      const subscriptionData = {
        route_id: routeId,
        stop_id: stopId,
        times: [timeRange],
        active: true
      };

      await createSubscription(subscriptionData);
      Alert.alert('Success', 'Subscription created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Subscription</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Route</Text>
          <RouteSelector 
            onRouteSelect={handleRouteSelect}
            disabled={loading}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stop</Text>
          <StopSelector
            routeId={routeId}
            onStopSelect={handleStopSelect}
            disabled={loading}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Days of the Week</Text>
          <DaySelector 
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            disabled={loading}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time Range</Text>
          <TimeRangeSelector 
            startTime={startTime}
            endTime={endTime}
            showStartPicker={showStartPicker}
            showEndPicker={showEndPicker}
            onStartTimePress={() => setShowStartPicker(true)}
            onEndTimePress={() => setShowEndPicker(true)}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            disabled={loading}
          />
        </View>
        
        <FormButtons 
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

export default AddSubscriptionScreen;