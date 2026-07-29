/**
 * GoOne Customer App — Location Service
 * Thin wrapper around react-native-geolocation-service and Android's
 * built-in PermissionsAndroid. No hardcoded fallback coordinates here —
 * callers must handle the "no location available" case explicitly.
 */
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export type AndroidPermissionResult = 'granted' | 'denied' | 'never_ask_again';
export type IOSAuthorizationResult = 'granted' | 'denied';

export async function requestAndroidPermission(): Promise<AndroidPermissionResult> {
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'GoOne needs your location to show nearby shops and estimate ride pickup times.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    },
  );

  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'never_ask_again';
  return 'denied';
}

export async function requestIOSAuthorization(): Promise<IOSAuthorizationResult> {
  const status = await Geolocation.requestAuthorization('whenInUse');
  return status === 'granted' ? 'granted' : 'denied';
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        reject(new Error(error?.message || 'Unable to determine current location.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
