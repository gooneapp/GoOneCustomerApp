import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Phone, Lock } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please enter phone and password/PIN');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // In a real app we hit the backend
      // const res = await apiClient.post('/auth/login', { phone, password, role: 'customer' });
      // login({ id: res.data.user.id, name: res.data.user.name, phone, token: res.data.token });
      
      // Mock flow for now:
      setTimeout(() => {
        login({ id: 'c-1', name: 'GoOne Customer', phone, token: 'mock-token-xyz' });
        navigation.replace('MainTabs');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      // setLoading(false); // don't set false if navigating away
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your phone number and PIN to continue</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Phone Number"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            leftIcon={<Phone color={theme.colors.textMuted} size={20} />}
          />
          <Input 
            label="4-Digit PIN / Password"
            placeholder="Enter your secret PIN"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock color={theme.colors.textMuted} size={20} />}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('OtpVerification')}>
            <Text style={styles.forgotText}>Forgot PIN? Login with OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Secure Login" 
            onPress={handleLogin} 
            size="large"
            loading={loading}
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to GoOne? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtpVerification')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  form: {
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  forgotText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  signupText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  signupLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});
