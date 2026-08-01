/**
 * Camera / photo-library permission handling.
 *
 * Mirrors the shape of src/services/location.ts so screens deal with one idiom.
 * The Android branch is hand-rolled on PermissionsAndroid rather than
 * react-native-permissions because the storage permission differs by API level:
 * READ_MEDIA_IMAGES from 33, READ_EXTERNAL_STORAGE below it.
 */
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

export type PermissionResult = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

/** Android 13 (API 33) replaced READ_EXTERNAL_STORAGE with scoped media permissions. */
function androidPhotoPermission(): Permission {
  return (Platform.Version as number) >= 33
    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
}

type Permission = Parameters<typeof PermissionsAndroid.request>[0];

async function requestAndroid(permission: Permission): Promise<PermissionResult> {
  try {
    // Already granted — asking again would show no prompt and return 'denied'
    // on some OEM builds, so check first.
    if (await PermissionsAndroid.check(permission)) return 'granted';

    const result = await PermissionsAndroid.request(permission);
    if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'never_ask_again';
    return 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * On iOS the picker libraries present the system prompt themselves, and the
 * NSCamera/NSPhotoLibrary usage strings in Info.plist are what actually matter —
 * without them the app terminates rather than showing a prompt.
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'granted';
  return requestAndroid(PermissionsAndroid.PERMISSIONS.CAMERA);
}

export async function requestPhotoLibraryPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'granted';
  // Android 13+ delivers gallery results through the photo picker, which needs
  // no permission at all. Requesting anyway is harmless and keeps older OEM
  // builds working.
  return requestAndroid(androidPhotoPermission());
}

/**
 * Explains a refusal and, when the user has permanently dismissed the prompt,
 * offers the only remaining route — the system settings screen.
 */
export function explainPermissionDenial(result: PermissionResult, what: 'camera' | 'photos'): void {
  const subject = what === 'camera' ? 'the camera' : 'your photos';

  if (result === 'never_ask_again') {
    Alert.alert(
      'Permission needed',
      `GoOne cannot open ${subject} because the permission was turned off. You can re-enable it in Settings.`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void Linking.openSettings() },
      ],
    );
    return;
  }

  Alert.alert('Permission needed', `GoOne needs access to ${subject} to attach this file.`);
}
