/**
 * Supabase client — used only for IIT Ropar user authentication (OTP/magic-link).
 * Keys are public (anon) by design; Row Level Security enforces data access.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — auth will not work.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

/** Domain that is allowed to sign in */
export const ALLOWED_DOMAIN = 'iitrpr.ac.in';

/** Returns true if the email belongs to the allowed institution */
export const isAllowedEmail = (email: string): boolean =>
    email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
