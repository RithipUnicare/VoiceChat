import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
}) => {
    const getButtonMode = (): 'contained' | 'outlined' | 'text' => {
        switch (variant) {
            case 'outline':
                return 'outlined';
            case 'secondary':
                return 'contained';
            default:
                return 'contained';
        }
    };

    const getButtonColor = () => {
        if (variant === 'secondary') {
            return '#03dac6';
        }
        return undefined; // Use default theme color
    };

    return (
        <PaperButton
            mode={getButtonMode()}
            onPress={onPress}
            loading={loading}
            disabled={disabled || loading}
            style={[{ marginVertical: 8 }, style]}
            contentStyle={{ paddingVertical: 6 }}
            buttonColor={getButtonColor()}
        >
            {title}
        </PaperButton>
    );
};

export default Button;
