/**
 * GoOne Customer App — Location Store
 * Requests location permission + a one-shot fix on Android/iOS and caches
 * the result. Screens that render a MapView must only ever READ this
 * state — HomeScreen is the sole screen that calls
 * requestPermissionAndLocation(), to avoid a permission-prompt vs.
 * Google Maps Fragment mount race.
 */
import { Platform } from 'react-native';
import { create } from 'zustand';
import { requestAndroidPermission, requestIOSAuthorization, getCurrentPosition } from '../services/location';
import { placesApi } from '../api/client';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

interface LocationState {
  permissionStatus: PermissionStatus;
  location: { lat: number; lng: number } | null;
  address: string | null;
  isManual: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermissionAndLocation: () => Promise<void>;
  setManualLocation: (loc: { lat: number; lng: number; address: string }) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  permissionStatus: 'undetermined',
  location: null,
  address: null,
  isManual: false,
  isLoading: false,
  error: null,

  requestPermissionAndLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === 'android') {
        const result = await requestAndroidPermission();
        if (result === 'granted') {
          set({ permissionStatus: 'granted' });
        } else if (result === 'never_ask_again') {
          set({ permissionStatus: 'blocked', isLoading: false });
          return;
        } else {
          set({ permissionStatus: 'denied', isLoading: false });
          return;
        }
      } else {
        const result = await requestIOSAuthorization();
        if (result === 'granted') {
          set({ permissionStatus: 'granted' });
        } else {
          set({ permissionStatus: 'denied', isLoading: false });
          return;
        }
      }

      const location = await getCurrentPosition();
      set({ location, isLoading: false, isManual: false });

      // Reverse-geocode is best-effort — a failure here must not undo the
      // coordinate fix that was just stored above.
      try {
        const result = await placesApi.reverseGeocode(location.lat, location.lng);
        set({ address: result?.formattedAddress ?? null });
      } catch {
        // Leave address null; caller-facing fallback chain handles this.
      }
    } catch (err: any) {
      set({ error: err?.message || 'Unable to determine current location.', isLoading: false });
    }
  },

  setManualLocation: ({ lat, lng, address }) =>
    set({ location: { lat, lng }, address, isManual: true }),

  clearError: () => set({ error: null }),
}));
