import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

/**
 * Upload a PWA app screenshot to Supabase Storage
 */
export async function uploadPWAScreenshot(
  file: File,
  appId: string
): Promise<string> {
  try {
    // Compress image
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Create file path
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `pwa-screenshots/${appId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, compressedFile, {
        contentType: compressedFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading PWA screenshot:', error);
    throw error;
  }
}

/**
 * Upload multiple PWA app screenshots
 */
export async function uploadPWAScreenshots(
  files: File[],
  appId: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadPWAScreenshot(file, appId));
  return Promise.all(uploadPromises);
}

/**
 * Upload a PWA app icon to Supabase Storage
 */
export async function uploadPWAIcon(
  file: File,
  appId: string
): Promise<string> {
  try {
    // Compress image
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 512,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Create file path
    const fileName = `icon_${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `pwa-screenshots/${appId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, compressedFile, {
        contentType: compressedFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading PWA icon:', error);
    throw error;
  }
}
