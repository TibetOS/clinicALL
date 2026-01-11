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
