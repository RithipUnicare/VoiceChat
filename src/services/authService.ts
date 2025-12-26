import apiClient from './apiClient';
import { LoginRequest, SignupRequest, TokenResponse } from '../types/types';

export const authService = {
    // Login
    async login(credentials: LoginRequest): Promise<TokenResponse> {
        const response = await apiClient.post<TokenResponse>('/api/auth/login', credentials);
        return response.data;
    },

    // Signup
    async signup(data: SignupRequest): Promise<any> {
        const response = await apiClient.post('/api/auth/signup', data);
        return response.data;
    },

    // Request Password Reset
    async requestPasswordReset(email: string): Promise<any> {
        const response = await apiClient.post('/api/auth/request-password-reset', { email });
        return response.data;
    },

    // Reset Password
    async resetPassword(token: string, newPassword: string): Promise<any> {
        const response = await apiClient.post('/api/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Refresh Token
    async refreshToken(refreshToken: string): Promise<any> {
        const response = await apiClient.post('/api/auth/refresh', { refreshToken });
        return response.data;
    },

    // Update User Role (admin function)
    async updateUserRole(mobileNumber: string, roles: string): Promise<string> {
        const response = await apiClient.post<string>('/api/auth/update-role', {
            mobileNumber,
            roles,
        });
        return response.data;
    },
};
