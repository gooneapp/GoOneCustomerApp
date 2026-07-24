import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const getBackgroundColor = () => {
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.secondary;
    if (variant === 'outline') return 'transparent';
    if (variant === 'ghost') return 'transparent';
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (variant === 'outline') return theme.colors.primary;
    if (variant === 'ghost') return theme.colors.primary;
    return '#090d16'; // Dark text for primary/secondary buttons
  };

  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 1, borderColor: theme.colors.primary };
    return {};
  };

  const getPadding = () => {
    if (size === 'small') return { paddingVertical: 8, paddingHorizontal: 16 };
    if (size === 'large') return { paddingVertical: 16, paddingHorizontal: 32 };
    return { paddingVertical: 12, paddingHorizontal: 24 }; // medium
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getPadding(),
        disabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  }
});
