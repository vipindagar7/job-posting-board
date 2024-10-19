import axios from 'axios';
import { refreshTokenAPI } from './authAPI';

console.log("listining port in asiox", import.meta.env.DOMAIN)

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
    withCredentials: true,  // Allows sending cookies with requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        // You can add any token or other headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if it's an authentication error (403 Forbidden) and the request wasn't retried yet
        if (error.response && error.response.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                await refreshTokenAPI(); // Call the refresh token function

                // Retry the original request after refreshing the token
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                
                window.location.href = '/';

                return Promise.reject(refreshError);  // Reject with refresh error
            }
        }

        // If not a 403 error or request retry failed, reject the original error
        return Promise.reject(error);
    }
);

export default axiosInstance;
