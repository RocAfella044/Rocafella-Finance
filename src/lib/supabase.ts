import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_CONFIG_ERROR =
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.';

export const supabase: SupabaseClient = (() => {
  if (!supabaseUrl || !supabaseAnonKey) return null as unknown as SupabaseClient;
  return createClient(supabaseUrl, supabaseAnonKey);
})();
