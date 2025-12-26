import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { UserResponse, LoginRequest, SignupRequest } from '../types/types';

interface AuthContextType {
    user: UserResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (accessToken) {
                // Token exists, fetch user profile
                const userData = await userService.getProfile();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid tokens
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);

            // Save tokens
            await AsyncStorage.setItem('accessToken', response.accessToken);
            await AsyncStorage.setItem('refreshToken', response.refreshToken);

            // Fetch user profile
            const userData = await userService.getProfile();
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: SignupRequest) => {
        try {
            setIsLoading(true);
            await authService.signup(data);
            // After signup, user needs to login
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await userService.getProfile();
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
