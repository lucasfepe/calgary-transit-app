// components/subscriptions/EditSubscriptionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Platform, Switch, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { updateSubscription } from '@/services/subscriptions/subscriptionService';
import { TimeRange, Subscription } from '@/types/subscription';
import { styles } from './styles/addSubscriptionStyles'; // Reuse the same styles
import RouteSelector from './components/RouteSelector';
import StopSelector from './components/StopSelector';
import DaySelector from './components/DaySelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import FormButtons from './components/FormButtons';
import { ScreenNavigationProp, ScreenRouteProp } from '@/types';

type EditScreenRouteProp = RouteProp<{ EditSubscription: { subscription: Subscription } }, 'EditSubscription'>;

const EditSubscriptionScreen = () => {
    const navigation = useNavigation<ScreenNavigationProp<'EditSubscription'>>();
    const route = useRoute<EditScreenRouteProp>();
    const { subscription } = route.params;

    // Pre-populate with existing subscription data
    const [routeId, setRouteId] = useState(subscription.route_id);
    const [routeDisplayText, setRouteDisplayText] = useState(
        subscription.routeDetails?.route_long_name
            ? `${subscription.route_id} - ${subscription.routeDetails.route_long_name}`
            : subscription.route_id
    );
    const [stopId, setStopId] = useState(subscription.stop_id);
    const [stopName, setStopName] = useState(
        subscription.stopDetails?.stop_name || subscription.stop_id
    );

    // Initialize with first time range, if it exists
    const initialTimeRange = subscription.times && subscription.times.length > 0
        ? subscription.times[0]
        : null;

    const [selectedDays, setSelectedDays] = useState<number[]>(
        initialTimeRange ? initialTimeRange.weekdays : []
    );

    const [startTime, setStartTime] = useState(
        initialTimeRange ? new Date(initialTimeRange.startTime) : new Date()
    );

    const [endTime, setEndTime] = useState(
        initialTimeRange ? new Date(initialTimeRange.endTime) : new Date(Date.now() + 60 * 60 * 1000)
    );

    // Add state for active status
    const [isActive, setIsActive] = useState(subscription.active);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRouteSelect = (id: string, displayText: string) => {
        setRouteId(id);
        setRouteDisplayText(displayText);
        // Only clear stop if route has changed
        if (id !== subscription.route_id) {
            setStopId('');
            setStopName('');
        }
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

    const toggleActiveStatus = () => {
        setIsActive(!isActive);
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

            // Prepare the update data, preserving existing fields not in the form
            const updatedSubscriptionData = {
                route_id: routeId,
                stop_id: stopId,
                times: [timeRange],
                // Use the active state from our toggle
                active: isActive,
                // Preserve existing settings
                notificationSettings: subscription.notificationSettings,
                notificationDistance: subscription.notificationDistance
            };

            // Call the update API with the subscription ID and updated data
            await updateSubscription(subscription._id, updatedSubscriptionData);

            Alert.alert('Success', 'Subscription updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating subscription:', error);
            Alert.alert('Error', 'Failed to update subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Edit Subscription</Text>

                {/* Active Status Toggle */}
                <View style={toggleStyles.toggleContainer}>
                    <Text style={toggleStyles.toggleLabel}>
                        Subscription Status: {isActive ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isActive ? "#007AFF" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleActiveStatus}
                        value={isActive}
                        disabled={loading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Route</Text>
                    <RouteSelector
                        onRouteSelect={handleRouteSelect}
                        disabled={loading}
                        initialRouteId={routeId}
                        initialRouteDisplayText={routeDisplayText}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Stop</Text>
                    <StopSelector
                        routeId={routeId}
                        onStopSelect={handleStopSelect}
                        disabled={loading}
                        initialStopId={stopId}
                        initialStopName={stopName}
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
                    submitButtonText="Update Subscription"
                />
            </View>
        </ScrollView>
    );
};

// Additional styles for the toggle
const toggleStyles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    }
});

export default EditSubscriptionScreen;