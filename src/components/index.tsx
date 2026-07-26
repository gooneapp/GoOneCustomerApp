/**
 * GoOne Customer App — Shared components (Button, Input, VoiceButton)
 * Re-exports from a shared theme.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput } from 'react-native';
import { theme } from '../theme/theme';

export const Button = ({ title, onPress, variant = 'primary', size = 'medium', loading = false, disabled = false, fullWidth = false, style }: any) => {
  const styles: any = {
    primary: { backgroundColor: theme.colors.primary, ...theme.shadows.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.primary },
    ghost: { backgroundColor: theme.colors.primaryLight },
    danger: { backgroundColor: theme.colors.danger },
  };
  const textColors: any = { primary: '#fff', secondary: '#fff', outline: theme.colors.primary, ghost: theme.colors.primary, danger: '#fff' };
  const sizeStyle = { small: { paddingHorizontal: 16, paddingVertical: 8 }, medium: { paddingHorizontal: 24, paddingVertical: 14 }, large: { paddingHorizontal: 32, paddingVertical: 18 } };
  return (
    <TouchableOpacity
      style={[{ borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' }, styles[variant], (sizeStyle as any)[size], (disabled || loading) && { opacity: 0.5 }, fullWidth && { width: '100%' }, style]}
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
    >
      <Text style={{ fontWeight: '700', fontSize: size === 'large' ? 17 : size === 'small' ? 13 : 15, color: textColors[variant] }}>
        {loading ? '...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export const Input = ({ label, placeholder, value, onChangeText, error, keyboardType, secureTextEntry, maxLength, containerStyle, leftIcon, rightIcon, onRightIconPress, autoFocus }: any) => (
  <View style={[{ marginBottom: 16 }, containerStyle]}>
    {label ? <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text> : null}
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: error ? theme.colors.danger : theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, minHeight: 52 }}>
      {leftIcon ? <View style={{ paddingHorizontal: 14 }}>{leftIcon}</View> : null}
      <TextInput style={{ flex: 1, fontSize: 15, color: theme.colors.text, paddingVertical: 14, paddingHorizontal: leftIcon ? 4 : 14 }} placeholder={placeholder} placeholderTextColor={theme.colors.textLight} value={value} onChangeText={onChangeText} keyboardType={keyboardType} secureTextEntry={secureTextEntry} maxLength={maxLength} autoFocus={autoFocus} />
      {rightIcon ? <TouchableOpacity style={{ paddingHorizontal: 14 }} onPress={onRightIconPress}>{rightIcon}</TouchableOpacity> : null}
    </View>
    {error ? <Text style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
  </View>
);

export const VoiceButton = ({ text, language = 'en', size = 18, color = theme.colors.primary }: any) => (
  <TouchableOpacity style={{ padding: 4 }} accessibilityLabel="Hear this">
    <Text style={{ fontSize: size, color }}>🔊</Text>
  </TouchableOpacity>
);
