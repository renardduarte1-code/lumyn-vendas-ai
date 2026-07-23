import jwt from 'jsonwebtoken';
import { env } from '../../config';

export type AccessTokenPayload = {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessTokenPayload;
}
