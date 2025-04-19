// components/admin/AdminButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface AdminButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const AdminButton: React.FC<AdminButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>Admin</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminButton;