/**
 * In-memory access token store.
 *
 * The access token is NEVER persisted to localStorage, sessionStorage,
 * IndexedDB, or cookies accessible by JavaScript. It lives only in this
 * module-level variable for the lifetime of the page.
 *
 * The refresh token is handled exclusively by the backend via an HttpOnly
 * cookie, which JavaScript cannot read.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
