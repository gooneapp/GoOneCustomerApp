/**
 * GoOne Customer App — VoiceButton Component
 * 🔊 Voice guidance for key screens. Language/voice is Admin-configurable.
 */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme/theme';

interface VoiceButtonProps {
  text: string;
  language?: 'ta' | 'en' | 'hi';
  size?: number;
  color?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  language = 'en',
  size = 18,
  color = theme.colors.primary,
}) => (
  <TouchableOpacity
    style={{ padding: 4 }}
    accessibilityLabel="Hear this text"
    accessibilityHint={text}
    onPress={() => {
      // Text-to-speech integration point.
      // Admin configures voice on/off per language from Admin CMS.
      // In production: react-native-tts or expo-speech
      console.log(`[VoiceButton] Speaking in ${language}: ${text}`);
    }}
  >
    <Text style={{ fontSize: size, color }}>🔊</Text>
  </TouchableOpacity>
);
