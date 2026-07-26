/**
 * GoOne Customer App — Auth Store
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens, clearTokens } from '../api/client';

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
        set({ user, isAuthenticated: true, language: (lang[1] as any) || 'en', isLoading: false });
      } else {
        set({ isLoading: false, language: (lang[1] as any) || 'en' });
      }
    } catch { set({ isLoading: false }); }
  },

  loginSuccess: async (user, at, rt) => {
    setTokens(at, rt);
    await AsyncStorage.multiSet([['access_token', at], ['refresh_token', rt], ['user', JSON.stringify(user)]]);
    set({ user, isAuthenticated: true });
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('language', lang);
    set({ language: lang });
  },

  logout: async () => {
    clearTokens();
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({ user: null, isAuthenticated: false });
  },
}));
