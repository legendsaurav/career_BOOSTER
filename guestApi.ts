// guestApi.ts — backend-backed guest target-lock (replaces the removed Supabase client).
// Same function names/return shapes the app already expects, so callers don't change.

import { getApiBaseUrl } from './api';

const base = () => getApiBaseUrl();

export interface GuestTargetLock {
  targetProfessorId: string;
  targetProfessorName?: string;
  branchName?: string;
  lockedAt?: string;
}

export const getGuestTargetLockByEmail = async (
  email: string,
): Promise<{ data: GuestTargetLock | null; error: any }> => {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return { data: null, error: null };
  try {
    const r = await fetch(`${base()}/api/guest-lock?email=${encodeURIComponent(clean)}`, { credentials: 'include' });
    const j = await r.json();
    const d = j?.data;
    if (d && d.targetProfessorId) {
      return {
        data: {
          targetProfessorId: String(d.targetProfessorId),
          targetProfessorName: d.targetProfessorName || undefined,
          branchName: d.branchName || undefined,
          lockedAt: d.lockedAt || undefined,
        },
        error: null,
      };
    }
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const insertGuestTargetLock = async (row: {
  name: string;
  email: string;
  targetProfessorId: string;
  targetProfessorName?: string;
  branchName?: string;
  role?: string | null;
  photo?: string | null;
  location?: string | null;
}) => {
  const targetProfessorId = String(row.targetProfessorId || '').trim();
  if (!targetProfessorId) return { data: null, error: new Error('Missing target professor id') };
  try {
    const r = await fetch(`${base()}/api/guest-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: row.email,
        name: row.name,
        targetProfessorId,
        targetProfessorName: row.targetProfessorName || '',
        branchName: row.branchName || '',
      }),
    });
    const j = await r.json();
    return { data: j?.lock || null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Visitor tracking is handled by trackVisit(); kept for call-site compatibility as a no-op.
export const insertGuestLogin = async (_row: any) => ({ data: null, error: null });
