/**
 * GoOne Customer App — Auth Store
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens, clearTokens, setOnAuthExpired, authApi } from '../api/client';

export interface User { id: string; name: string; phone: string; preferred_language: 'ta' | 'en' | 'hi'; }

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: 'ta' | 'en' | 'hi';
  initialize: () => Promise<void>;
  loginSuccess: (user: User, at: string, rt: string) => Promise<void>;
  setLanguage: (lang: 'ta' | 'en' | 'hi') => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, isAuthenticated: false, isLoading: true, language: 'en',

  initialize: async () => {
    try {
      const [at, rt, userStr, lang] = await AsyncStorage.multiGet(['access_token', 'refresh_token', 'user', 'language']);
      const user = userStr[1] ? JSON.parse(userStr[1]) : null;
      if (at[1] && rt[1] && user) {
        setTokens(at[1], rt[1]);
        const finalLang = user.preferred_language || lang[1] || 'en';
        set({ user, isAuthenticated: true, language: (finalLang as any), isLoading: false });
        if (finalLang !== lang[1]) await AsyncStorage.setItem('language', finalLang);
      } else {
        set({ isLoading: false, language: (lang[1] as any) || 'en' });
      }
    } catch { set({ isLoading: false }); }
  },

  loginSuccess: async (user, at, rt) => {
    setTokens(at, rt);
    const finalLang = user.preferred_language || 'en';
    await AsyncStorage.multiSet([
      ['access_token', at], 
      ['refresh_token', rt], 
      ['user', JSON.stringify(user)],
      ['language', finalLang]
    ]);
    set({ user, isAuthenticated: true, language: finalLang as any });
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('language', lang);
    set({ language: lang });
    // Sync with backend if logged in
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      authApi.updateLanguage(lang).catch(err => console.error('Failed to sync language:', err));
    }
  },

  logout: async () => {
    clearTokens();
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({ user: null, isAuthenticated: false });
  },
}));

// Registered once at module load. A terminally-failed token refresh (expired
// refresh token) already clears storage/memory tokens inside client.ts's
// interceptor — this callback additionally resets the store's isAuthenticated
// flag so the navigator actually bounces the user back to Login instead of
// leaving them stuck on a dead screen silently 401ing forever.
setOnAuthExpired(() => useAuthStore.setState({ user: null, isAuthenticated: false }));
