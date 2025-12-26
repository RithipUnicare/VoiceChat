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

type SignupScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        mobileNumber?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
            newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await signup({
                name: formData.name.trim(),
                mobileNumber: formData.mobileNumber.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            Alert.alert('Success', 'Account created successfully! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error: any) {
            Alert.alert(
                'Signup Failed',
                error.response?.data?.message || 'Failed to create account. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    <View style={styles.form}>
                        <TextInput
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChangeText={(text) => updateField('name', text)}
                            error={errors.name}
                        />

                        <TextInput
                            label="Mobile Number"
                            placeholder="Enter your mobile number"
                            keyboardType="phone-pad"
                            value={formData.mobileNumber}
                            onChangeText={(text) => updateField('mobileNumber', text)}
                            error={errors.mobileNumber}
                            maxLength={10}
                        />

                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(text) => updateField('email', text)}
                            error={errors.email}
                        />

                        <TextInput
                            label="Password"
                            placeholder="Create a password"
                            isPassword
                            value={formData.password}
                            onChangeText={(text) => updateField('password', text)}
                            error={errors.password}
                        />

                        <TextInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            isPassword
                            value={formData.confirmPassword}
                            onChangeText={(text) => updateField('confirmPassword', text)}
                            error={errors.confirmPassword}
                        />

                        <Button title="Sign Up" onPress={handleSignup} loading={loading} />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableRipple onPress={() => navigation.replace('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#6200ee',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SignupScreen;
