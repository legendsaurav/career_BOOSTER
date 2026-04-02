import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Prefer environment variables from Vite: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// Fallback to localStorage keys `SUPABASE_URL` / `SUPABASE_ANON_KEY` if available.
const getSupabaseUrl = (): string | null => {
  try {
    // `import.meta.env` is available in Vite-built apps
    // @ts-ignore
    const envUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_URL : undefined;
    if (envUrl) return envUrl;
  } catch (e) {}
  try { return localStorage.getItem('SUPABASE_URL'); } catch (e) { return null; }
};

const getSupabaseKey = (): string | null => {
  try {
    // @ts-ignore
    const envKey = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY : undefined;
    if (envKey) return envKey;
  } catch (e) {}
  try { return localStorage.getItem('SUPABASE_ANON_KEY'); } catch (e) { return null; }
};

// Defaults (will be used only when Vite env or localStorage are not set)
const DEFAULT_SUPABASE_URL = 'https://qjddgukoeevcuqimzrcf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGRndWtvZWV2Y3VxaW16cmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTIxMjksImV4cCI6MjA4MTI4ODEyOX0.tYwpoJSVXkCW-_kFO70jQfmwkzccQzhjtaxeGJXvoBs';

const SUPABASE_URL = getSupabaseUrl() || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = getSupabaseKey() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface GuestLoginRow {
  name: string;
  email?: string | null;
  role?: string | null;
  photo?: string | null;
  location?: string | null;
  metadata?: any;
}

export const insertGuestLogin = async (row: GuestLoginRow) => {
  if (!supabase) {
    // Supabase client not configured; no-op
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('guest_logins')
      .insert([{
        name: row.name,
        email: row.email || null,
        role: row.role || null,
        photo: row.photo || null,
        location: row.location || null,
        metadata: row.metadata || null,
      }]);
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};
