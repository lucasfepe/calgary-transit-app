// utils/platformUtils.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const isExpoGo = Constants.appOwnership === 'expo';
export const isProductionBuild = !isExpoGo;

export const getTopPosition = (expoValue: number, productionValue: number): number => {
  return isExpoGo ? expoValue : productionValue;
};