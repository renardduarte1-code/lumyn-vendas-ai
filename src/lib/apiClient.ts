/// <reference types="vite/client" />
const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

export type ApiError = { message: string; code?: string };

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const url = API_URL + endpoint;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.reload();
    }
    const message = (data as ApiError).message || 'Erro na API';
    throw new Error(message);
  }

  return data as T;
}
