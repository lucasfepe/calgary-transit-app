// services/transit/tripMapping/constants.ts
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const CACHE_KEY_PREFIX = 'route_mapping_cache_';
export const INDEX_KEY = 'trip_index_cache';
export const TIMESTAMP_KEY = 'last_update_cache';
export const CHUNK_SIZE = 50;
export const ROUTE_DATA_KEY_PREFIX = 'route_data_cache_';
export const ROUTE_DATA_TIMESTAMP_KEY = 'route_data_timestamp';