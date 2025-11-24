import crypto from 'crypto';

const ENCRYPTION_METHOD = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM authentication tag

export interface EncryptedSecret {
  encryptedValue: string;
  iv: string;
  authTag: string;
}

export interface DecryptedSecret {
  value: string;
}

/**
 * Encrypt a secret using AES-256-GCM
 * Returns encrypted value with IV and auth tag for integrity verification
 */
export function encryptSecret(value: string): EncryptedSecret {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ENCRYPTION_METHOD, keyBuffer, iv);

    let encryptedData = cipher.update(value, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encryptedValue: encryptedData,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Failed to encrypt secret: ${error}`);
  }
}

/**
 * Decrypt a secret using AES-256-GCM
 * Verifies integrity using the authentication tag
 */
export function decryptSecret(encrypted: EncryptedSecret): DecryptedSecret {
  try {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_METHOD, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decryptedData = decipher.update(encrypted.encryptedValue, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return { value: decryptedData };
  } catch (error) {
    throw new Error(`Failed to decrypt secret: ${error}`);
  }
}

/**
 * Generate a secure random secret key
 */
export function generateSecretKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a value for comparison (e.g., API key fingerprints)
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Verify a hashed value
 */
export function verifyHash(value: string, hash: string): boolean {
  return hashValue(value) === hash;
}
