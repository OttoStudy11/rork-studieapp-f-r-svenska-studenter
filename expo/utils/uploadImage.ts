import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export async function uploadCommunityImage(
  base64Data: string,
  communityId: string,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log('[uploadImage] Starting upload for community:', communityId);

    const fileName = `${communityId}/${userId}_${Crypto.randomUUID()}.jpg`;
    const bucket = 'community-images';

    let binaryData: Uint8Array;

    if (Platform.OS === 'web') {
      const raw = atob(base64Data);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        arr[i] = raw.charCodeAt(i);
      }
      binaryData = arr;
    } else {
      const raw = global.atob
        ? global.atob(base64Data)
        : base64ToBytes(base64Data);
      if (typeof raw === 'string') {
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
          arr[i] = raw.charCodeAt(i);
        }
        binaryData = arr;
      } else {
        binaryData = raw;
      }
    }

    console.log('[uploadImage] Binary size:', binaryData.length, 'bytes');

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, binaryData, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('[uploadImage] Upload error:', error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('[uploadImage] Upload success:', publicUrlData.publicUrl);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('[uploadImage] Exception:', err);
    return { url: null, error: err?.message || 'Upload failed' };
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const len = base64.length;
  let bufferLength = len * 0.75;
  if (base64[len - 1] === '=') bufferLength--;
  if (base64[len - 2] === '=') bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const e1 = lookup[base64.charCodeAt(i)];
    const e2 = lookup[base64.charCodeAt(i + 1)];
    const e3 = lookup[base64.charCodeAt(i + 2)];
    const e4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (e1 << 2) | (e2 >> 4);
    bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    bytes[p++] = ((e3 & 3) << 6) | e4;
  }

  return bytes;
}
