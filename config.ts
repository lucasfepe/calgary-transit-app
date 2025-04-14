// config.ts
import { Platform } from 'react-native';

//mateus computer : 10.0.0.177
// inceptionu laptop : 10.44.22.28
const DEV_MACHINE_IP = '10.44.22.28'; // Your development machine's IP
const PROD_API_URL = 'https://your-production-api.com'; // Your production API URL

export const TRIP_MAPPING_API_URL = __DEV__ 
  ? Platform.select({
      android: `http://${DEV_MACHINE_IP}:3000`,
      ios: 'http://localhost:3000', // iOS simulator can use localhost
      default: 'http://localhost:3000'
    })
  : PROD_API_URL;