import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Lock } from 'lucide-react-native';

export const OtpVerificationScreen: React.FC<any> = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We've sent a code to your number</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="6-Digit OTP"
            placeholder="000000"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            leftIcon={<Lock color={theme.colors.textMuted} size={20} />}
          />
        </View>

        <View style={styles.footer}>
          <Button 
            title="Verify & Login" 
            onPress={() => navigation.replace('Login')} 
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, padding: theme.spacing.lg },
  header: { marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl },
  title: { ...theme.typography.h1, marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.body, color: theme.colors.textMuted },
  form: { flex: 1 },
  footer: { marginTop: 'auto', paddingBottom: theme.spacing.xl },
});
