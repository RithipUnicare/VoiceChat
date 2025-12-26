import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { authService } from '../../services/authService';

type ResetPasswordScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
    route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
    const { token } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await authService.resetPassword(token, password);

            Alert.alert('Success', 'Your password has been reset successfully!', [
                { text: 'OK', onPress: () => navigation.replace('Login') },
            ]);
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to reset password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your new password</Text>

                    <View style={styles.form}>
                        <TextInput
                            label="New Password"
                            placeholder="Create a new password"
                            isPassword
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            error={errors.password}
                        />

                        <TextInput
                            label="Confirm Password"
                            placeholder="Confirm your new password"
                            isPassword
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword)
                                    setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            error={errors.confirmPassword}
                        />

                        <Button title="Reset Password" onPress={handleResetPassword} loading={loading} />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
});

export default ResetPasswordScreen;
