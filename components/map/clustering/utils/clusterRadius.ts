import { Region } from '../../types';
import { MAP_CONSTANTS } from '../../constants';
import { CLUSTERING_CONSTANTS } from '../../constants';

export const getClusterRadius = (region: Region): number => {
  if (region.latitudeDelta > MAP_CONSTANTS.ZOOM_LEVELS.FAR) {
    return CLUSTERING_CONSTANTS.RADIUS.FAR;
  } else if (region.latitudeDelta > MAP_CONSTANTS.ZOOM_LEVELS.MEDIUM) {
    return CLUSTERING_CONSTANTS.RADIUS.MEDIUM;
  } else if (region.latitudeDelta > MAP_CONSTANTS.ZOOM_LEVELS.CLOSE) {
    return CLUSTERING_CONSTANTS.RADIUS.CLOSE;
  }
  return 0;
};