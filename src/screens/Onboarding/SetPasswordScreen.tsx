import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Speakable } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetPassword'>;

export const SetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  // This screen is only ever reached via navigation.navigate('SetPassword',
  // { phone, setup_token }) from OtpVerifyScreen — both are always supplied
  // in practice even though the param-list types them optional to allow
  // direct/deep-link navigation.
  const { phone, setup_token } = (route.params || {}) as { phone: string; setup_token: string };
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { language, loginSuccess } = useAuthStore();
  const handleSet = async () => {
    const e: any = {};
    if (!name.trim()) e.name = 'Enter your name';
    if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const res = await authApi.setPassword(setup_token, password, name.trim(), language);
      await loginSuccess({ id: res.user?.id, name: res.user?.name, phone, preferred_language: language }, res.access_token, res.refresh_token);
      navigation.navigate('Consent');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to set password');
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Speakable text="Create your account" textStyle={styles.title} containerStyle={styles.titleRow} language={language} />
          <Text style={styles.sub}>Set your name and a secure password</Text>
          <Input label="Your Name" placeholder="Full name" value={name} onChangeText={setName} error={errors.name} />
          <Input label="Password" placeholder="Min 6 characters" secureTextEntry value={password} onChangeText={setPassword} error={errors.password} />
          <Input label="Confirm Password" placeholder="Re-enter password" secureTextEntry value={confirm} onChangeText={setConfirm} error={errors.confirm} />
          <Button title={loading ? '' : 'Create Account'} onPress={handleSet} loading={loading} size="large" fullWidth />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  titleRow: { marginBottom: 8 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.xl },
});
