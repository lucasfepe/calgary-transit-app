import { Platform } from 'react-native';
import Constants from 'expo-constants';

let BASE_API_URL: string;

const environment = Constants.expoConfig?.extra?.ENVIRONMENT ||
                    Constants.manifest?.extra?.ENVIRONMENT ||
                    'development';

console.log('Environment:', environment);

if (environment === 'development') {
  let CURRENT_DEV_MACHINE = '';
  let DEV_MACHINE_IPS: Record<string, string> = {};
  try {
    // Only require the file in dev, and ignore if missing
    ({ CURRENT_DEV_MACHINE, DEV_MACHINE_IPS } = require('./config.local'));
  } catch (e) {
    console.warn('Missing config.local. Using localhost');
  }
  const DEV_MACHINE_IP =
    DEV_MACHINE_IPS[CURRENT_DEV_MACHINE] || Object.values(DEV_MACHINE_IPS)[0] || 'localhost';
  console.log('Using DEV_MACHINE_IP:', DEV_MACHINE_IP);
  BASE_API_URL = Platform.select({
    android: `http://${DEV_MACHINE_IP}:3000`,
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  }) as string;
} else {
  const productionBackend = Constants.expoConfig?.extra?.PRODUCTION_BACKEND ||
                            Constants.manifest?.extra?.PRODUCTION_BACKEND ||
                            'https://your-production-api.com';
  console.log('Using production backend URL:', productionBackend);
  BASE_API_URL = productionBackend;
}

export { BASE_API_URL };