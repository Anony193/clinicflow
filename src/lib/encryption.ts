/**
 * PHI Encryption Utility (Constraint #12)
 *
 * AES-256-GCM field-level encryption for PHI fields.
 * Used for: medical history, consent form URLs, credentials.
 *
 * In production, the encryption key is stored in AWS KMS / Secrets Manager.
 * The key is never logged or committed to version control.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.PHI_ENCRYPTION_KEY;
  if (!key) {
    // In sandbox, generate a deterministic key (not for production!)
    if (process.env.NODE_ENV !== 'production') {
      return crypto.scryptSync('sandbox-key', 'salt', 32);
    }
    throw new Error('PHI_ENCRYPTION_KEY is required in production');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM.
 * Returns a base64 string containing IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Format: base64(iv + tag + ciphertext)
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt a string encrypted with encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, 'base64');

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Encrypt a JSON object (for medical history, etc.)
 */
export function encryptJSON(obj: unknown): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt a JSON object
 */
export function decryptJSON<T = unknown>(ciphertext: string): T {
  return JSON.parse(decrypt(ciphertext)) as T;
}
