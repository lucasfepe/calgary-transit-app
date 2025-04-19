// ./services/api/adminApiService.ts
import { auth } from '../../firebaseConfig';

class AdminApiService {
  private readonly baseUrl: string = 'https://your-api-url.com'; // Replace with your actual API URL

  async getIdToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  async callAdminEndpoint<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    body: any = null
  ): Promise<T> {
    try {
      const token = await this.getIdToken();
      console.log("@1");
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : null
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }
      
      return data as T;
    } catch (error) {
      console.error('Admin API error:', error);
      throw error;
    }
  }
  
  async clearCache(): Promise<{ success: boolean }> {
    return this.callAdminEndpoint<{ success: boolean }>('/admin/clearcache', 'POST');
  }
  
  // Add more admin API methods as needed
}

export const adminApiService = new AdminApiService();