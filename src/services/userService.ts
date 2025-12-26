import apiClient from './apiClient';
import { UserResponse, UserUpdateRequest } from '../types/types';

export const userService = {
    // Get User Profile
    async getProfile(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>('/api/user/me');
        return response.data;
    },

    // Update User Profile
    async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
        const response = await apiClient.put<UserResponse>('/api/user/me', data);
        return response.data;
    },
};
