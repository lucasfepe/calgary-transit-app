// services/auth/userService.ts
import { makeApiCall } from '@/services/auth/authRequest';
import { BASE_API_URL } from '@/config';

export interface UserResponse {
    success: boolean;
    message: string;
}

/**
 * Delete user account and all associated data
 */
export const deleteUserAccount = async (): Promise<UserResponse> => {
    try {
        const response = await makeApiCall<UserResponse>(
            `${BASE_API_URL}/users/delete-account`,
            'DELETE'
        );

        return response || { success: false, message: 'No response from server' };
    } catch (error) {
        console.error('Error deleting user account:', error);
        return {
            success: false,
            message: 'Failed to delete user account'
        };
    }
};

export default {
    deleteUserAccount
};