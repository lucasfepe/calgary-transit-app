// components/notifications/NotificationSettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import notificationService from '../../services/notifications/notificationService';
import { NotificationSettings } from '../../services/notifications/types';

const NotificationSettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    minTimeBetweenNotifications: 10
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const userSettings = await notificationService.getNotificationSettings();
    if (userSettings) {
      setSettings(userSettings);
    }
    setLoading(false);
  };

  const handleToggleNotifications = async (value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await notificationService.toggleNotifications(value);
  };

  const handleToggleSound = async (value: boolean) => {
    const newSettings = { ...settings, soundEnabled: value };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings({ soundEnabled: value });
  };

  const handleToggleVibration = async (value: boolean) => {
    const newSettings = { ...settings, vibrationEnabled: value };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings({ vibrationEnabled: value });
  };

  const handleTimeChange = async (value: number) => {
    const newSettings = { ...settings, minTimeBetweenNotifications: value };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings({ minTimeBetweenNotifications: value });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={handleToggleSound}
            disabled={!settings.enabled}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Vibration</Text>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={handleToggleVibration}
            disabled={!settings.enabled}
          />
        </View>
        
        <Text style={styles.settingLabel}>
          Minimum time between notifications: {settings.minTimeBetweenNotifications} minutes
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={30}
          step={1}
          value={settings.minTimeBetweenNotifications}
          onValueChange={(value: number) => setSettings({...settings, minTimeBetweenNotifications: value})}
          onSlidingComplete={handleTimeChange}
          disabled={!settings.enabled}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#000000"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
});

export default NotificationSettingsScreen;