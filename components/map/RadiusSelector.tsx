import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';

interface RadiusSelectorProps {
  radius: number;
  onRadiusChange: (value: number) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  radius,
  onRadiusChange,
}) => (
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={radius}
      style={styles.picker}
      onValueChange={(itemValue: number) => onRadiusChange(itemValue)}
    >
      <Picker.Item label="1 mile" value={1} />
      <Picker.Item label="2 miles" value={2} />
      <Picker.Item label="5 miles" value={5} />
      <Picker.Item label="10 miles" value={10} />
      <Picker.Item label="20 miles" value={20} />
      <Picker.Item label="All" value={999999} />
    </Picker>
  </View>
);