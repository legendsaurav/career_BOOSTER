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

export interface GuestTargetLock {
  targetProfessorId: string;
  targetProfessorName?: string;
  branchName?: string;
  lockedAt?: string;
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

export const getGuestTargetLockByEmail = async (email: string) => {
  if (!supabase) {
    return { data: null as GuestTargetLock | null, error: new Error('Supabase not configured') };
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { data: null as GuestTargetLock | null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('guest_logins')
      .select('metadata, created_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) return { data: null as GuestTargetLock | null, error };

    const rows = Array.isArray(data) ? data : [];
    for (const row of rows) {
      const metadata = (row as any)?.metadata || {};
      const targetProfessorId = String(metadata?.targetProfessorId || '').trim();
      if (!targetProfessorId) continue;

      return {
        data: {
          targetProfessorId,
          targetProfessorName: String(metadata?.targetProfessorName || '').trim() || undefined,
          branchName: String(metadata?.branchName || '').trim() || undefined,
          lockedAt: String(metadata?.lockedAt || (row as any)?.created_at || '').trim() || undefined,
        },
        error: null,
      };
    }

    return { data: null as GuestTargetLock | null, error: null };
  } catch (err) {
    return { data: null as GuestTargetLock | null, error: err };
  }
};

export const insertGuestTargetLock = async (row: {
  name: string;
  email: string;
  role?: string | null;
  photo?: string | null;
  location?: string | null;
  targetProfessorId: string;
  targetProfessorName?: string;
  branchName?: string;
}) => {
  const cleanTargetId = String(row.targetProfessorId || '').trim();
  if (!cleanTargetId) {
    return { data: null, error: new Error('Missing target professor id') };
  }

  return insertGuestLogin({
    name: row.name,
    email: row.email,
    role: row.role || null,
    photo: row.photo || null,
    location: row.location || null,
    metadata: {
      event: 'target_lock',
      immutableTarget: true,
      targetProfessorId: cleanTargetId,
      targetProfessorName: row.targetProfessorName || '',
      branchName: row.branchName || '',
      lockedAt: new Date().toISOString(),
    },
  });
};
