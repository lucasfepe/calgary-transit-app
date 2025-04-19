// components/subscriptions/components/TimeRangeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/addSubscriptionStyles';

interface TimeRangeSelectorProps {
  startTime: Date;
  endTime: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  onStartTimePress: () => void;
  onEndTimePress: () => void;
  onStartTimeChange: (event: any, selectedDate?: Date) => void;
  onEndTimeChange: (event: any, selectedDate?: Date) => void;
  disabled: boolean;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  showStartPicker,
  showEndPicker,
  onStartTimePress,
  onEndTimePress,
  onStartTimeChange,
  onEndTimeChange,
  disabled
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <View style={styles.timeContainer}>
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={onStartTimePress}
          disabled={disabled}
        >
          <Text style={styles.timeButtonText}>
            Start: {formatTime(startTime)}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.timeSeperator}>to</Text>
        
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={onEndTimePress}
          disabled={disabled}
        >
          <Text style={styles.timeButtonText}>
            End: {formatTime(endTime)}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onStartTimeChange}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onEndTimeChange}
        />
      )}
    </>
  );
};

export default TimeRangeSelector;