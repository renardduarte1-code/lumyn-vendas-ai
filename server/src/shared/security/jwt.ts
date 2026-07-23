import jwt from 'jsonwebtoken';
import { env } from '../../config';

export type AccessTokenPayload = {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
  sessionId: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as RefreshTokenPayload;
}
