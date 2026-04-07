import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.6;

export async function compressImage(uri: string): Promise<{ uri: string; base64: string; mimeType: string }> {
  try {
    console.log('[compressImage] Starting compression for:', uri);

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const r = reader.result as string;
          resolve(r.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      console.log('[compressImage] Web fallback base64 length:', base64.length);
      return { uri, base64, mimeType: 'image/jpeg' };
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    console.log('[compressImage] Compressed image size:', manipulated.width, 'x', manipulated.height);
    console.log('[compressImage] Base64 length:', manipulated.base64?.length ?? 0);

    return {
      uri: manipulated.uri,
      base64: manipulated.base64 || '',
      mimeType: 'image/jpeg',
    };
  } catch (err) {
    console.error('[compressImage] Compression failed, falling back to original:', err);
    return { uri, base64: '', mimeType: 'image/jpeg' };
  }
}
