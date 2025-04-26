// config.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let PRODUCTION_URL: string = process.env.PRODUCTION_BACKEND || '';

if (process.env.TRANSIT_APP_CONFIG) {
  try {
    const config = JSON.parse(
      Buffer.from(process.env.TRANSIT_APP_CONFIG, 'base64').toString('utf-8')
    );
    if (typeof config.PRODUCTION_URL === 'string') {
      PRODUCTION_URL = config.PRODUCTION_URL;
    }
  } catch (err) {
    console.warn('Failed to decode or parse TRANSIT_APP_CONFIG:', err);
  }
}

const isDev =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : Constants.expoConfig?.extra?.ENVIRONMENT === 'development';

// These will be replaced at runtime in dev mode, ignored in prod
let BASE_API_URL: string;
if (isDev) {
  // Try to load ./config.local.ts (will error in prod or CI, which is fine)
  let DEV_MACHINE_IPS: Record<string, string> = {};
  let CURRENT_DEV_MACHINE = 'mateus';
  try {
    // @ts-ignore
    const devConfig = require('./config.local'); // Not present in production!
    DEV_MACHINE_IPS = devConfig.DEV_MACHINE_IPS;
    CURRENT_DEV_MACHINE = devConfig.CURRENT_DEV_MACHINE || CURRENT_DEV_MACHINE;
  } catch (e) {
    // fallback if config.local isn't present
  }
  const DEV_MACHINE_IP =
    DEV_MACHINE_IPS[CURRENT_DEV_MACHINE] || Object.values(DEV_MACHINE_IPS)[0] || 'localhost';

  BASE_API_URL = Platform.select({
    android: `http://${DEV_MACHINE_IP}:3000`,
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  }) as string;
} else {
  BASE_API_URL = PRODUCTION_URL;
}

export { BASE_API_URL };