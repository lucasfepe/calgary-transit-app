
import { auth } from '@/firebaseConfig'; // Adjust the import path as needed
import { User, IdTokenResult } from '@firebase/auth';

class AdminService {
  /**
   * Check if the current user is an admin
   * @returns Promise<boolean> True if user is an admin, false otherwise
   */
  async isUserAdmin(): Promise<boolean> {
    try {
      const user: User | null = auth.currentUser;
      
      if (!user) {
        return false;
      }
      
      // Get the ID token result which contains custom claims
      const idTokenResult: IdTokenResult = await user.getIdTokenResult(true); // Force refresh
      
      // Check if the admin claim exists and is true
      return idTokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
  
  /**
   * Force refresh the token to get updated claims
   * @returns Promise<boolean> True if token was refreshed, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const user: User | null = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}

export const adminService = new AdminService();