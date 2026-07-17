/**
 * Supabase client — used only for IIT Ropar user authentication (OTP/magic-link).
 * Keys are public (anon) by design; Row Level Security enforces data access.
 */
import { createClient } from '@supabase/supabase-js';

// Fallbacks are the project's PUBLIC (publishable/anon) values — safe to ship in the
// browser bundle. They keep the app from crashing when Vercel env vars aren't set;
// override them per-environment with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const FALLBACK_URL = 'https://qjddgukoeevcuqimzrcf.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_r9CRuWy4hh-618rTE-PBWg_By_NXERY';

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>;
const supabaseUrl = (env.VITE_SUPABASE_URL || FALLBACK_URL).trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Domain that is allowed to sign in */
export const ALLOWED_DOMAIN = 'iitrpr.ac.in';

/** Returns true if the email belongs to the allowed institution */
export const isAllowedEmail = (email: string): boolean =>
    email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
