// components/subscriptions/components/FormButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../styles/formButtonsStyles';

interface FormButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitButtonText?: string; // Add this optional prop
}

const FormButtons = ({
  onCancel,
  onSubmit,
  loading,
  submitButtonText = 'Create Subscription'
}: FormButtonsProps) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default FormButtons;