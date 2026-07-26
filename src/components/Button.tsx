/**
 * GoOne Customer App — Button Component
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'medium',
  loading = false, disabled = false, fullWidth = false, style,
}) => {
  const bgMap: Record<string, string> = {
    primary:   theme.colors.primary,
    secondary: theme.colors.secondary,
    outline:   'transparent',
    ghost:     theme.colors.primaryLight,
    danger:    theme.colors.danger,
  };
  const txtMap: Record<string, string> = {
    primary: '#fff', secondary: '#fff', outline: theme.colors.primary, ghost: theme.colors.primary, danger: '#fff',
  };
  const szMap: Record<string, object> = {
    small:  { paddingHorizontal: 16, paddingVertical: 8 },
    medium: { paddingHorizontal: 24, paddingVertical: 14 },
    large:  { paddingHorizontal: 32, paddingVertical: 18 },
  };
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bgMap[variant] },
        variant === 'outline' && styles.outline,
        szMap[size],
        (disabled || loading) && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: txtMap[variant], fontSize: size === 'large' ? 17 : size === 'small' ? 13 : 15 }]}>
        {loading ? '...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base:      { borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  outline:   { borderWidth: 2, borderColor: theme.colors.primary },
  disabled:  { opacity: 0.5 },
  fullWidth: { width: '100%' },
  text:      { fontWeight: '700' },
});
