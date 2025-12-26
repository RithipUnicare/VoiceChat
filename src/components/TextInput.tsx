import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper';

interface CustomTextInputProps extends Omit<React.ComponentProps<typeof PaperTextInput>, 'error'> {
    error?: string;
    isPassword?: boolean;
}

const TextInput: React.FC<CustomTextInputProps> = ({
    label,
    error,
    isPassword = false,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
            <PaperTextInput
                label={label}
                mode="outlined"
                error={!!error}
                secureTextEntry={isPassword && !showPassword}
                right={
                    isPassword ? (
                        <PaperTextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    ) : undefined
                }
                {...props}
            />
            {error && (
                <HelperText type="error" visible={!!error}>
                    {error}
                </HelperText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
});

export default TextInput;
