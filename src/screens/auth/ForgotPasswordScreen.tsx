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
import { RootStackParamList } from '../../types/types';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { authService } from '../../services/authService';

type ForgotPasswordScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleResetRequest = async () => {
        if (!validateEmail()) return;

        try {
            setLoading(true);
            await authService.requestPasswordReset(email.trim());

            Alert.alert(
                'Success',
                'Password reset instructions have been sent to your email.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }]
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to send reset email. Please try again.'
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
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </Text>

                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            error={error}
                        />

                        <Button title="Send Reset Link" onPress={handleResetRequest} loading={loading} />

                        <Button
                            title="Back to Login"
                            onPress={() => navigation.navigate('Login')}
                            variant="outline"
                            style={styles.backButton}
                        />
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
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    backButton: {
        marginTop: 16,
    },
});

export default ForgotPasswordScreen;
