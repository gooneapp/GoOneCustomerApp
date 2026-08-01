/**
 * Avatar that doubles as the profile-photo uploader.
 *
 * Profile photos are private files, so their bytes come from
 * GET /api/v1/files/:id, which needs the bearer token. React Native's Image
 * loader supports per-source headers on both platforms, so the token is passed
 * through `source.headers` rather than trying to use a bare URL.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '../theme/theme';
import { BASE_URL, usersApi } from '../api/client';
import { chooseSource, describeUploadError, uploadFile } from '../services/fileUpload';

interface ProfilePhotoProps {
  fileId?: string | null;
  fallbackLetter: string;
  size?: number;
  editable?: boolean;
  onChanged?: (fileId: string) => void;
}

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  fileId,
  fallbackLetter,
  size = 80,
  editable = true,
  onChanged,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failedToLoad, setFailedToLoad] = useState(false);

  React.useEffect(() => {
    void AsyncStorage.getItem('access_token').then(setToken);
  }, [fileId]);

  const handlePress = useCallback(() => {
    if (!editable || isUploading) return;

    chooseSource({
      onPicked: (file) => {
        setIsUploading(true);
        setProgress(0);
        setFailedToLoad(false);

        void uploadFile(file, 'profile_photo', { onProgress: setProgress })
          .then((uploaded) => usersApi.setProfilePhoto(uploaded.id).then(() => uploaded.id))
          .then((newFileId) => onChanged?.(newFileId))
          .catch((err) => Alert.alert('Could not update photo', describeUploadError(err)))
          .finally(() => setIsUploading(false));
      },
    });
  }, [editable, isUploading, onChanged]);

  const showImage = fileId && token && !failedToLoad;
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!editable || isUploading}
      activeOpacity={editable ? 0.7 : 1}
      style={[styles.wrapper, dimension]}
    >
      {showImage ? (
        <Image
          source={{
            uri: `${BASE_URL}/files/${fileId}?token=${token}`,
            headers: { Authorization: `Bearer ${token}` },
          }}
          style={[styles.image, dimension]}
          onError={() => setFailedToLoad(true)}
        />
      ) : (
        <View style={[styles.fallback, dimension]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
            {fallbackLetter.toUpperCase()}
          </Text>
        </View>
      )}

      {isUploading && (
        <View style={[styles.overlay, dimension]}>
          <ActivityIndicator color="#fff" size="small" />
          {progress >= 0 && <Text style={styles.progressText}>{progress}%</Text>}
        </View>
      )}

      {editable && !isUploading && (
        <View style={styles.badge}>
          <Camera color="#fff" size={13} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { justifyContent: 'center', alignItems: 'center' },
  image: { backgroundColor: theme.colors.surfaceAlt },
  fallback: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: { fontWeight: '900', color: '#fff' },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
