import { getIdToken } from "./auth";

// Define a type for the HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Define the function with TypeScript types
export const makeApiCall = async <T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data: any = null
): Promise<T | undefined> => {
    // console.log('Making API call:', { endpoint, method });
    const token = await getIdToken();
    if (!token) {
        console.error('No token available');
        return undefined;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        let url = endpoint;
        let body = null;

        // For GET requests, append data as query parameters to the URL
        if (method === 'GET' && data) {
            const queryParams = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                queryParams.append(key, String(value));
            });
            url = `${endpoint}?${queryParams.toString()}`;
        }
        // For non-GET requests, use data as the request body
        else if (data) {
            body = JSON.stringify(data);
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        return res as T;
    } catch (error) {
        console.error('API call failed:', error);
        return undefined;
    }
};