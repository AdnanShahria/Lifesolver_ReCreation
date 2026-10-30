import jwt from '@tsndr/cloudflare-worker-jwt';

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTE_LENGTH = 16;
const DERIVED_KEY_BITS = 256;

/**
 * Generate cryptographically secure random salt in hex (16 bytes = 128 bits)
 */
export function generateSalt(length = SALT_BYTE_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash password using Web Crypto PBKDF2 (SHA-256, 100,000 iterations)
 */
export async function hashPassword(
  password: string,
  providedSalt?: string
): Promise<{ hashHex: string; saltHex: string }> {
  const saltHex = providedSalt || generateSalt();
  const saltBytes = hexToBytes(saltHex);
  const enc = new TextEncoder();
  const passwordBytes = enc.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    DERIVED_KEY_BITS
  );

  const hashHex = bytesToHex(new Uint8Array(derivedBits));
  return { hashHex, saltHex };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify password against stored PBKDF2 hash and salt
 */
export async function verifyPassword(
  password: string,
  storedHashHex: string,
  storedSaltHex: string
): Promise<boolean> {
  if (!password || !storedHashHex || !storedSaltHex) {
    return false;
  }
  const { hashHex } = await hashPassword(password, storedSaltHex);
  return timingSafeEqual(hashHex, storedHashHex);
}

/**
 * Generate secure 6-digit numeric OTP
 */
export function generateNumericOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 900000) + 100000;
  return code.toString();
}

/**
 * Generate User Session JWT (Valid for 30 days for Hard Login session persistence)
 */
export async function signUserToken(
  user: { id: string; email: string; name: string },
  secret: string,
  expiresInSeconds = 30 * 24 * 60 * 60 // 30 Days hard session
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + expiresInSeconds
    },
    secret
  );
}
