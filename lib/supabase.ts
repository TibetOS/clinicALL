import { createClient } from '@supabase/supabase-js';
import { createLogger } from './logger';

const logger = createLogger('Supabase');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Missing Supabase environment variables. Using mock mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Disable navigator lock to prevent AbortError when tabs close or components unmount
      // The lock function wraps async operations to prevent race conditions across tabs
      // Using a no-op lock that immediately executes the callback without locking
      lock: async <R>(_name: string, _acquireTimeout: number, callback: () => Promise<R>): Promise<R> => {
        return await callback();
      },
    },
  }
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

/**
 * Check if a phone number already exists in the database
 * Normalizes phone by removing dashes/spaces before comparison
 * @returns true if phone exists (unavailable), false if available
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // In mock mode, always return false (available)
    return false;
  }

  // Normalize phone - remove all non-digit characters
  const normalizedPhone = phone.replace(/\D/g, '');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (error) {
      logger.error('Error checking phone uniqueness:', error);
      return false; // Allow signup to proceed if check fails
    }

    return !!data; // true if phone exists
  } catch (err) {
    logger.error('Phone check exception:', err);
    return false;
  }
}

/**
 * Check if an email already exists in the database
 * Case-insensitive comparison
 * @returns true if email exists (unavailable), false if available
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // In mock mode, always return false (available)
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      logger.error('Error checking email uniqueness:', error);
      return false; // Allow signup to proceed if check fails
    }

    return !!data; // true if email exists
  } catch (err) {
    logger.error('Email check exception:', err);
    return false;
  }
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL of the uploaded file, or null on error
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    logger.warn('Supabase not configured, cannot upload image');
    return null;
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    logger.error('Image upload exception:', err);
    return null;
  }
}
