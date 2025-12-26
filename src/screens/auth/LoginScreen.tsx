import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/types';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { login } = useAuth();
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ mobileNumber?: string; password?: string }>({});

    const validateForm = () => {
        const newErrors: { mobileNumber?: string; password?: string } = {};

        if (!mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(mobileNumber.trim())) {
            newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await login({ mobileNumber: mobileNumber.trim(), password });
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid credentials. Please try again.'
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
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    <View style={styles.form}>
                        <TextInput
                            label="Mobile Number"
                            placeholder="Enter your mobile number"
                            keyboardType="phone-pad"
                            value={mobileNumber}
                            onChangeText={(text) => {
                                setMobileNumber(text);
                                if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: undefined });
                            }}
                            error={errors.mobileNumber}
                            maxLength={10}
                        />

                        <TextInput
                            label="Password"
                            placeholder="Enter your password"
                            isPassword
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            error={errors.password}
                        />

                        <TouchableRipple
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableRipple>

                        <Button title="Login" onPress={handleLogin} loading={loading} />

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableRipple onPress={() => navigation.replace('Signup')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableRipple>
                        </View>
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#6200ee',
        fontSize: 14,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        color: '#6200ee',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
