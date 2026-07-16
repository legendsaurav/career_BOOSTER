class BadRequestError extends Error {
  public readonly code: number;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.code = 400;
  }
}

const DEFAULT_MAX_TOTAL_BYTES = 10 * 1024; // 10 KB
const DEFAULT_MAX_STRING_LEN = 2000; // per-field

function isPlainObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof RegExp);
}

function sanitizeString(s: string, maxLen = DEFAULT_MAX_STRING_LEN): string {
  if (typeof s !== 'string') return s;
  // Remove control characters except newline/tab, trim whitespace
  const cleaned = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\u2028\u2029]/g, '').trim();
  if (cleaned.length > maxLen) {
    throw new BadRequestError(`String value exceeds maximum length of ${maxLen}`);
  }
  return cleaned;
}

function validateId(id: string, maxLen = 200) {
  if (!id || typeof id !== 'string') throw new BadRequestError('Invalid id');
  if (id.length > maxLen) throw new BadRequestError('ID too long');
  const ok = /^[A-Za-z0-9-_:.@]{1,200}$/.test(id);
  if (!ok) throw new BadRequestError('ID contains invalid characters');
  return id;
}

function isValidEmail(email: string) {
  if (typeof email !== 'string') return false;
  // simple email regex
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isValidPassword(pw: string) {
  if (typeof pw !== 'string') return false;
  // minimum 8 chars
  return pw.length >= 8;
}

function validatePayload(payload: any, opts?: { maxTotalBytes?: number; maxStringLen?: number }) {
  const maxTotal = opts?.maxTotalBytes || DEFAULT_MAX_TOTAL_BYTES;
  const maxStringLen = opts?.maxStringLen || DEFAULT_MAX_STRING_LEN;

  function walk(value: any): any {
    if (typeof value === 'string') return sanitizeString(value, maxStringLen);
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
    if (Array.isArray(value)) return value.map(walk);
    if (isPlainObject(value)) {
      const out: any = {};
      for (const k of Object.keys(value)) {
        const v = value[k];
        out[k] = walk(v);
      }
      return out;
    }
    // disallow functions, symbols, bigints, etc.
    throw new BadRequestError('Unsupported data type in payload');
  }

  const cleaned = walk(payload);
  const json = JSON.stringify(cleaned);
  let size: number;
  if (typeof TextEncoder !== 'undefined') {
    size = new TextEncoder().encode(json).length;
  } else {
    // Fallback for Node environments
    // @ts-ignore
    size = Buffer ? Buffer.byteLength(json, 'utf8') : json.length;
  }
  if (size > maxTotal) throw new BadRequestError(`Payload too large (${size} bytes). Max ${maxTotal} bytes`);
  return cleaned;
}

export { BadRequestError, validatePayload, validateId, isValidEmail, isValidPassword, sanitizeString };
