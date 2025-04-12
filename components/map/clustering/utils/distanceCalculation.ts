import { Point } from '../../types';

// Convert latitude/longitude difference to approximate pixels at a given zoom level
export const getPixelDistance = (
  point1: Point,
  point2: Point,
  latitudeDelta: number,
  mapWidth: number = 375 // Default iOS screen width, adjust as needed
) => {
  const LATITUDE_TO_PIXELS = mapWidth / latitudeDelta;
  const LONGITUDE_TO_PIXELS = mapWidth / (latitudeDelta * 2);

  const pixelDX = (point2.longitude - point1.longitude) * LONGITUDE_TO_PIXELS;
  const pixelDY = (point2.latitude - point1.latitude) * LATITUDE_TO_PIXELS;

  return Math.sqrt(pixelDX * pixelDX + pixelDY * pixelDY);
};
