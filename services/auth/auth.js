// auth.ts
import { getAuth } from 'firebase/auth';


// Function to get the current user's ID token
export const getIdToken = async () => {
    const auth = getAuth();
    if (auth.currentUser) {
        try {
            const token = await auth.currentUser.getIdToken(true);
            return token;
        } catch (error) {
            console.error('Error getting ID token:', error);
            return null;
        }
    }
    return null;
};