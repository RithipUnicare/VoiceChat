import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://app.undefineddevelopers.online/voicenote';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
