import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { LogOut, Globe, Package } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { authApi, usersApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { useTranslation, type TranslationKey } from '../../utils/i18n';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, setLanguage } = useAuthStore();
  const { t } = useTranslation();
  const handleLogout = async () => { try { await authApi.logout(); } catch {} await logout(); };
  const [showLangModal, setShowLangModal] = React.useState(false);
  const [profilePhotoFileId, setProfilePhotoFileId] = React.useState<string | null>(null);

  // The photo lives on the user record rather than in the auth store, so it is
  // fetched once here and then kept in sync by ProfilePhoto's onChanged.
  React.useEffect(() => {
    usersApi
      .me()
      .then((me) => setProfilePhotoFileId(me.profile_photo_file_id))
      .catch(() => {
        // Non-fatal — the initial-letter avatar is shown instead.
      });
  }, []);

  const handleLanguage = () => {
    setShowLangModal(true);
  };
  
  const selectLang = (code: 'ta' | 'en' | 'hi') => {
    setLanguage(code);
    setShowLangModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader variant="sub" title={t('profile')} />
      
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowLangModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('language_and_voice')}</Text>
            <Text style={styles.modalSubtitle}>{t('choose_language')}</Text>
            
            <TouchableOpacity style={styles.langBtn} onPress={() => selectLang('ta')}>
              <Text style={styles.langBtnText}>தமிழ் (Tamil)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={() => selectLang('en')}>
              <Text style={styles.langBtnText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={() => selectLang('hi')}>
              <Text style={styles.langBtnText}>हिन्दी (Hindi)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLangModal(false)}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <ProfilePhoto
            fileId={profilePhotoFileId}
            fallbackLetter={(user?.name || 'U')[0]}
            size={80}
            onChanged={setProfilePhotoFileId}
          />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.menuCard}>
          {[
            { label: t('language_and_voice'), Icon: Globe, onPress: handleLanguage },
            { label: t('my_orders'), Icon: Package, onPress: () => navigation.navigate('MyOrders') },
          ].map((item) => {
            const Icon = item.Icon;
            return (
              <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
                <Icon color={theme.colors.primary} size={20} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={{ color: theme.colors.textLight }}>→</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert(t('logout'), 'Are you sure?', [{ text: t('cancel') }, { text: t('logout'), style: 'destructive', onPress: handleLogout }])}>
          <LogOut color={theme.colors.danger} size={20} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl, alignItems: 'center' },
  avatarWrap: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 4 },
  phone: { ...theme.typography.subtitle, marginBottom: theme.spacing.xl },
  menuCard: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', marginBottom: theme.spacing.xl, ...theme.shadows.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  menuLabel: { ...theme.typography.body, flex: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.dangerLight, width: '100%', borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.danger + '40' },
  logoutText: { color: theme.colors.danger, fontWeight: '700', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 24, alignItems: 'center', ...theme.shadows.md },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 24 },
  langBtn: { width: '100%', paddingVertical: 16, backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, marginBottom: 12, alignItems: 'center' },
  langBtnText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  cancelBtn: { width: '100%', paddingVertical: 16, marginTop: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.danger },
});
