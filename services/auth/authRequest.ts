import { getIdToken } from "./auth";

// Define a type for the HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Define the function with TypeScript types
export const makeApiCall = async <T>(endpoint: string, method: HttpMethod = 'GET', body: any = null): Promise<T | undefined> => {
    // console.log("makeApiCall called with:", endpoint, method, body);
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

        // console.log("endpoint:", endpoint, "method:", method,
        // "headers:",JSON.stringify(headers), "body:",(body ? JSON.stringify(body) : null))
        // );
        const response = await fetch(endpoint, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error('API call failed:', error);
        return undefined;
    }
};