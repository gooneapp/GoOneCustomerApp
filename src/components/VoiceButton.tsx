/**
 * GoOne Customer App — VoiceButton Component
 * 🔊 Voice guidance for key screens. Language/voice is Admin-configurable.
 */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Tts from 'react-native-tts';
import { theme } from '../theme/theme';

interface VoiceButtonProps {
  text: string;
  language?: 'ta' | 'en' | 'hi';
  size?: number;
  color?: string;
}

const LOCALE_MAP: Record<'ta' | 'en' | 'hi', string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' };
let ttsInitialized = false;

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
    onPress={async () => {
      try {
        if (!ttsInitialized) {
          await Tts.getInitStatus();
          ttsInitialized = true;
        }
        // Some devices lack the exact locale pack — swallow and fall back
        // to whatever default voice is already active.
        await Tts.setDefaultLanguage(LOCALE_MAP[language] ?? 'en-IN').catch(() => {});
        Tts.stop();
        Tts.speak(text);
      } catch {
        // No TTS engine available on this device — fail silently rather
        // than crash the screen over a decorative speaker icon.
      }
    }}
  >
    <Text style={{ fontSize: size, color }}>🔊</Text>
  </TouchableOpacity>
);
