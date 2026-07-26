import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../../theme/theme';
import { Input } from '../../components/index';
import { Button } from '../../components/index';
import { authApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
export const SetPasswordScreen: React.FC<any> = ({ route, navigation }) => {
  const { phone, setup_token } = route.params || {};
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
          <Text style={styles.title}>Create your account</Text>
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
  title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, marginBottom: 8 },
  sub: { color: theme.colors.textMuted, marginBottom: theme.spacing.xl },
});
