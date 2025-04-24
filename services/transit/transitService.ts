// services/transit/transitService.ts
import { Vehicle } from '@/types/vehicles';
import { makeApiCall } from '@/services/auth/authRequest';
import { TRIP_MAPPING_API_URL } from '@/config';


// Response type from backend
interface VehicleResponse {
  success: boolean;
  vehicles: Vehicle[];
  message?: string;
}

export class TransitService {
  // Event callbacks
  onVehicleUpdate?: (vehicle: Vehicle) => void;
  onBatchComplete?: (vehicles: Vehicle[]) => void;

  // State tracking
  private isLoading = false;
  private consecutiveFailures = 0;
  private maxConsecutiveFailures = 3;
  private lastSuccessfulFetch = 0;
  private backoffTime = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch vehicles near a specific location
   * @param lat Latitude
   * @param lon Longitude
   * @param radius Radius in miles (default: 1)
   */
  async fetchVehiclesNearby(lat: number, lon: number, radius: number = 1): Promise<Vehicle[]> {
    try {
      // Check if we're in backoff state
      if (this.isInBackoffState()) {
        console.log("Service in backoff state, waiting before retry");
        return [];
      }

      // Prevent concurrent requests
      if (this.isLoading) {
        console.log('Request already in progress, skipping');
        return [];
      }

      this.isLoading = true;

      // Make authenticated API call to backend
      const response = await makeApiCall<VehicleResponse>(
        `${TRIP_MAPPING_API_URL}/vehicles/nearby?lat=${lat}&lon=${lon}&radius=${radius}`,
        'GET'
      );
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch vehicles');
      }

      const vehicles = response.vehicles;

      // Notify about all vehicles at once
      if (vehicles.length > 0) {
        // Optionally notify about individual vehicles if needed
        if (this.onVehicleUpdate) {
          vehicles.forEach(vehicle => this.onVehicleUpdate!(vehicle));
        }

        // Notify about the complete set
        this.onBatchComplete?.(vehicles);
      }

      // Reset failure counter and update last successful fetch time
      this.consecutiveFailures = 0;
      this.lastSuccessfulFetch = Date.now();

      return vehicles;
    } catch (error) {
      this.consecutiveFailures++;

      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      console.error('Error fetching vehicle data from backend:', errorMessage);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check if the service is in a backoff state due to too many failures
   */
  isInBackoffState(): boolean {
    if (this.consecutiveFailures < this.maxConsecutiveFailures) {
      return false;
    }

    const now = Date.now();
    return (now - this.lastSuccessfulFetch) < this.backoffTime;
  }

  /**
   * Reset the failure counter
   */
  resetFailureCounter(): void {
    this.consecutiveFailures = 0;
  }
}

// Create and export a singleton instance
export const transitService = new TransitService();

// Export default for consistency with other services
export default transitService;