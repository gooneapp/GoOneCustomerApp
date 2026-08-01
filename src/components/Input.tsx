/**
 * GoOne Customer App — Input Component
 */
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  maxLength?: number;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText, error, keyboardType,
  secureTextEntry, maxLength, containerStyle, leftIcon, rightIcon,
  onRightIconPress, autoFocus, multiline, numberOfLines, editable = true,
  autoCapitalize, autoCorrect,
}) => (
  <View style={[styles.container, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={[styles.inputWrap, error ? styles.inputWrapError : null, !editable && styles.inputWrapDisabled]}>
      {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}
      <TextInput
        style={[styles.input, !!leftIcon && styles.inputWithLeft, !!multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {rightIcon ? (
        <TouchableOpacity style={styles.rightIconWrap} onPress={onRightIconPress}>
          {rightIcon}
        </TouchableOpacity>
      ) : null}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container:          { marginBottom: 16 },
  label:              { fontSize: 11, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  inputWrap:          { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, minHeight: 52 },
  inputWrapError:     { borderColor: theme.colors.danger },
  inputWrapDisabled:  { backgroundColor: theme.colors.surfaceAlt, opacity: 0.6 },
  leftIconWrap:       { paddingHorizontal: 14 },
  rightIconWrap:      { paddingHorizontal: 14 },
  input:              { flex: 1, fontSize: 15, color: theme.colors.text, paddingVertical: 14, paddingHorizontal: 14 },
  inputWithLeft:      { paddingLeft: 4 },
  inputMultiline:     { textAlignVertical: 'top', paddingTop: 14 },
  error:              { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});
