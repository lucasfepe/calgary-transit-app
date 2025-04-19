// components/subscriptions/components/FormButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../styles/addSubscriptionStyles';

interface FormButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const FormButtons: React.FC<FormButtonsProps> = ({ onCancel, onSubmit, loading }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Create Subscription</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FormButtons;