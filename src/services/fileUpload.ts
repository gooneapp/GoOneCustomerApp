/**
 * GoOne Customer App — File picking and upload.
 *
 * Every upload in the app goes through here. The service picks a file, hands it to
 * POST /api/v1/files, and returns the resulting file id, which the caller then
 * attaches to a domain record (KYC document, listing, product, …).
 *
 * The Customer app had no upload capability at all before this.
 */
import { Alert, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';

import api from '../api/client';
import {
  explainPermissionDenial,
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './mediaPermissions';

export type FilePurpose = 'profile_photo';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadedFile {
  id: string;
  mime_type: string;
  size_bytes: number;
  original_file_name: string;
  /** Present only for public-visibility purposes; private files are fetched by id. */
  url?: string;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Long edge cap and JPEG quality applied to camera captures.
 *
 * A modern phone camera produces 8-12 MB files. Uploading those over rural 3G is
 * slow enough to look broken, and they exceed the server's per-purpose limits.
 * react-native-image-picker resizes natively, so no extra dependency is needed.
 */
const IMAGE_MAX_DIMENSION = 1600;
const IMAGE_QUALITY = 0.8;

function assetToPickedFile(asset: Asset): PickedFile | null {
  if (!asset.uri) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    // Some Android OEMs return no type; the server re-derives it from the bytes anyway.
    type: asset.type ?? 'image/jpeg',
    ...(asset.fileSize ? { size: asset.fileSize } : {}),
  };
}

function firstAsset(response: ImagePickerResponse): PickedFile | null {
  if (response.didCancel) return null;
  if (response.errorCode) {
    Alert.alert('Could not open', response.errorMessage ?? 'Please try again.');
    return null;
  }
  const asset = response.assets?.[0];
  return asset ? assetToPickedFile(asset) : null;
}

export async function pickImageFromCamera(): Promise<PickedFile | null> {
  const permission = await requestCameraPermission();
  if (permission !== 'granted') {
    explainPermissionDenial(permission, 'camera');
    return null;
  }

  const response = await launchCamera({
    mediaType: 'photo',
    maxWidth: IMAGE_MAX_DIMENSION,
    maxHeight: IMAGE_MAX_DIMENSION,
    quality: IMAGE_QUALITY,
    saveToPhotos: false,
  });
  return firstAsset(response);
}

export async function pickImageFromLibrary(): Promise<PickedFile | null> {
  const permission = await requestPhotoLibraryPermission();
  if (permission !== 'granted') {
    explainPermissionDenial(permission, 'photos');
    return null;
  }

  const response = await launchImageLibrary({
    mediaType: 'photo',
    maxWidth: IMAGE_MAX_DIMENSION,
    maxHeight: IMAGE_MAX_DIMENSION,
    quality: IMAGE_QUALITY,
    selectionLimit: 1,
  });
  return firstAsset(response);
}

/**
 * Presents the camera / gallery chooser.
 *
 * No document option here: the Customer app only ever uploads a profile photo, so
 * the document-picker dependency is not installed.
 */
export function chooseSource(options: { onPicked: (file: PickedFile) => void }): void {
  Alert.alert('Add a photo', 'Where would you like to take it from?', [
    {
      text: 'Take Photo',
      onPress: () => {
        void pickImageFromCamera().then((f) => f && options.onPicked(f));
      },
    },
    {
      text: 'Choose from Gallery',
      onPress: () => {
        void pickImageFromLibrary().then((f) => f && options.onPicked(f));
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

const MAX_ATTEMPTS = 3;

function isRetryable(err: any): boolean {
  // Only network-level failures are worth repeating. A 400/413 will fail identically
  // however many times it is sent.
  if (err?.response) return err.response.status >= 500;
  return err?.code === 'ECONNABORTED' || err?.message === 'Network Error';
}

const delay = (ms: number) => new Promise<void>((resolve) => { setTimeout(() => resolve(), ms); });

/**
 * Uploads a picked file and returns its server-side record.
 *
 * Notes on the axios call:
 *  - `Content-Type` is set to undefined so React Native's fetch layer generates the
 *    multipart boundary itself. The shared client declares a default of
 *    `application/json`, which would otherwise win and leave the server unable to
 *    parse any part of the body. Hardcoding 'multipart/form-data' has the same
 *    problem — it omits the boundary.
 *  - `timeout: 0` overrides the client's 15s default, which is far too short for a
 *    photo on a rural 3G connection.
 */
export async function uploadFile(
  file: PickedFile,
  purpose: FilePurpose,
  options: UploadOptions = {},
): Promise<UploadedFile> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const formData = new FormData();
    formData.append('file', {
      // Android content:// URIs work as-is; iOS needs the file:// prefix stripped.
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      name: file.name,
      type: file.type,
    } as any);
    formData.append('purpose', purpose);

    try {
      const response = await api.post('/files', formData, {
        timeout: 0,
        headers: { 'Content-Type': undefined },
        ...(options.signal ? { signal: options.signal } : {}),
        onUploadProgress: (event) => {
          if (!options.onProgress) return;
          options.onProgress(
            event.total ? Math.round((event.loaded * 100) / event.total) : -1,
          );
        },
      });
      return response.data.data as UploadedFile;
    } catch (err: any) {
      lastError = err;
      if (err?.code === 'ERR_CANCELED' || options.signal?.aborted) throw err;
      if (attempt === MAX_ATTEMPTS || !isRetryable(err)) break;
      // 1s, then 2s.
      await delay(1000 * attempt);
    }
  }

  throw lastError;
}

/** Turns an upload failure into a sentence worth showing a shop owner. */
export function describeUploadError(err: any): string {
  const serverMessage = err?.response?.data?.error?.message;
  if (serverMessage) return serverMessage;
  if (err?.message === 'Network Error') {
    return 'No internet connection. Check your network and try again.';
  }
  if (err?.code === 'ECONNABORTED') {
    return 'The upload took too long. Try again on a stronger connection.';
  }
  return 'Upload failed. Please try again.';
}
