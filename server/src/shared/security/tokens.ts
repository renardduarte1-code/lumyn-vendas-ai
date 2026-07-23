import crypto from 'crypto';

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('base64url');
}

export function hashToken(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
