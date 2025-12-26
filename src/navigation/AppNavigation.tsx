import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import VoiceNoteDetailScreen from '../screens/main/VoiceNoteDetailScreen';
import CreateVoiceNoteScreen from '../screens/main/CreateVoiceNoteScreen';

import { RootStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading screen while checking auth status
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                // Authenticated Stack
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#6200ee',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'Voice Notes' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ title: 'Profile' }}
                    />
                    <Stack.Screen
                        name="VoiceNoteDetail"
                        component={VoiceNoteDetailScreen}
                        options={{ title: 'Note Details' }}
                    />
                    <Stack.Screen
                        name="CreateVoiceNote"
                        component={CreateVoiceNoteScreen}
                        options={{ title: 'Create Note' }}
                    />
                </Stack.Navigator>
            ) : (
                // Unauthenticated Stack
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default AppNavigation;
