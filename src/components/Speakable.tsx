/**
 * GoOne Customer App — Speakable
 * Small speaker icon that reads its paired text aloud via TTS. Replaces the
 * old single "voice guidance" button on the header (removed — poor
 * placement, unclear what it would read) with a per-element pattern: every
 * important heading/label/instruction gets its own compact, consistent
 * speaker affordance right next to it.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle, StyleProp, ViewStyle } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Tts from 'react-native-tts';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';

const LOCALE_MAP: Record<'ta' | 'en' | 'hi', string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' };
let ttsInitialized = false;

export async function speakText(text: string, language: 'ta' | 'en' | 'hi' = 'en'): Promise<void> {
  try {
    if (!ttsInitialized) {
      await Tts.getInitStatus();
      ttsInitialized = true;
    }
    // Some devices lack the exact locale pack — swallow and fall back to
    // whatever default voice is already active rather than blocking speech.
    await Tts.setDefaultLanguage(LOCALE_MAP[language] ?? 'en-IN').catch(() => { });
    Tts.stop();
    Tts.speak(text);
  } catch {
    // No TTS engine available on this device — fail silently rather than
    // crash the screen over a decorative speaker icon.
  }
}

interface SpeakableProps {
  /** Text shown AND spoken. For a longer instruction, pass the full sentence here. */
  text: string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  numberOfLines?: number;
  /** Defaults to the signed-in user's preferred language. */
  language?: 'ta' | 'en' | 'hi';
}

/** Text + a tappable speaker icon that reads it aloud. Use for any heading, label, or instruction that's worth hearing. */
export const Speakable: React.FC<SpeakableProps> = ({ text, textStyle, containerStyle, iconSize = 15, numberOfLines, language }) => {
  const authLanguage = useAuthStore((s) => s.language);
  const [speaking, setSpeaking] = useState(false);

  const handlePress = async () => {
    setSpeaking(true);
    await speakText(text, language ?? authLanguage ?? 'en');
    setTimeout(() => setSpeaking(false), 400);
  };

  return (
    <View style={[styles.row, containerStyle]}>
      <Text style={[styles.text, textStyle]} numberOfLines={numberOfLines}>
        {text}
      </Text>
      <TouchableOpacity
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[styles.iconBtn, speaking && styles.iconBtnActive]}
        accessibilityLabel={`Read aloud: ${text}`}
        accessibilityRole="button"
      >
        <Volume2 size={iconSize} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

/** Bare icon variant for rows that already render their own <Text> and just need the speaker appended. */
export const SpeakerIcon: React.FC<{ text: string; language?: 'ta' | 'en' | 'hi'; size?: number; color?: string; style?: StyleProp<ViewStyle> }> = ({
  text,
  language,
  size = 15,
  color,
  style,
}) => {
  const authLanguage = useAuthStore((s) => s.language);
  return (
    <TouchableOpacity
      onPress={() => speakText(text, language ?? authLanguage ?? 'en')}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.iconBtn, style]}
      accessibilityLabel={`Read aloud: ${text}`}
      accessibilityRole="button"
    >
      <Volume2 size={size} color={color ?? theme.colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { flexShrink: 1 },
  iconBtn: { padding: 3, borderRadius: theme.radius.full },
  iconBtnActive: { backgroundColor: theme.colors.primaryLight },
});
