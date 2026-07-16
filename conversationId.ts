/**
 * Per-user conversation id for the AI features.
 *
 * Every website user must get a STABLE, UNIQUE conversation id so their AI
 * conversation stays isolated on the gateway and never overlaps with another
 * user's — even when many users chat at the same time.
 *
 * - Logged-in users: derived from their email (stable across sessions/devices).
 * - Guests: a random id persisted in localStorage (stable for that browser).
 */

const SESSION_KEY = 'career-booster-session-state';
const GUEST_KEY = 'web_guest_id';

// Small, dependency-free stable hash (djb2) -> short hex. Avoids leaking the raw
// email into the conversation id while staying deterministic per user.
function stableHash(input: string): string {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
        h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
    }
    return h.toString(16);
}

function getLoggedInEmail(): string | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const email = parsed?.currentUser?.email;
        return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    } catch {
        return null;
    }
}

function getOrCreateGuestId(): string {
    try {
        let id = localStorage.getItem(GUEST_KEY);
        if (!id) {
            const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2) + Date.now().toString(36);
            id = 'guest_' + rnd;
            localStorage.setItem(GUEST_KEY, id);
        }
        return id;
    } catch {
        // localStorage unavailable — fall back to an ephemeral per-load id.
        return 'guest_ephemeral';
    }
}

/**
 * Returns a stable conversation id for the current user.
 * The backend namespaces this (prefixes `web_`) before sending to the gateway.
 */
export function getConversationId(): string {
    const email = getLoggedInEmail();
    if (email) return 'u_' + stableHash(email);
    return getOrCreateGuestId();
}
