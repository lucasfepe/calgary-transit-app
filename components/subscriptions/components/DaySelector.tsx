// components/subscriptions/components/DaySelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/addSubscriptionStyles';
import { weekdays } from '../constants';

interface DaySelectorProps {
  selectedDays: number[];
  onToggleDay: (dayId: number) => void;
  disabled: boolean;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onToggleDay, disabled }) => {
  return (
    <View style={styles.daysContainer}>
      {weekdays.map(day => (
        <TouchableOpacity
          key={day.id}
          style={[
            styles.dayButton,
            selectedDays.includes(day.id) && styles.selectedDay
          ]}
          onPress={() => onToggleDay(day.id)}
          disabled={disabled}
        >
          <Text 
            style={[
              styles.dayText,
              selectedDays.includes(day.id) && styles.selectedDayText
            ]}
          >
            {day.name.substring(0, 3)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default DaySelector;