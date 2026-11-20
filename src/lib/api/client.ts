import { clearAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type RequestOptions = RequestInit & {
  token?: string;
  _isRetry?: boolean;
};

// Concurrency lock for token refresh to avoid duplicate refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('hbs_refresh_token');
  if (!refreshToken) return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) {
        clearAuth();
        return null;
      }

      const data = (await res.json()) as { access?: string; refresh?: string };
      if (data.access) {
        localStorage.setItem('hbs_access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('hbs_refresh_token', data.refresh);
        }
        return data.access;
      }
      clearAuth();
      return null;
    } catch {
      clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function extractErrorMessage(errJson: unknown, fallback: string): string {
  if (!errJson || typeof errJson !== 'object') return fallback;
  const obj = errJson as Record<string, unknown>;
  if (typeof obj.detail === 'string') return obj.detail;
  if (typeof obj.error === 'string') return obj.error;
  if (typeof obj.message === 'string') return obj.message;

  const firstKey = Object.keys(obj)[0];
  if (firstKey) {
    const val = obj[firstKey];
    if (Array.isArray(val) && val.length > 0) {
      return `${firstKey}: ${String(val[0])}`;
    }
    if (typeof val === 'string') {
      return `${firstKey}: ${val}`;
    }
  }
  return JSON.stringify(errJson);
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, _isRetry, ...rest } = options;

  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('hbs_access_token') || undefined;
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  // Handle 401 Unauthorized with automatic refresh or public fallback
  if (response.status === 401 && !_isRetry && !path.includes('/auth/token/')) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiClient<T>(path, {
        ...options,
        token: newAccessToken,
        _isRetry: true,
      });
    }

    // Refresh failed or no refresh token available
    clearAuth();

    // If it's a GET request to public paths (e.g. browsing hotels or restaurants), retry anonymously
    const method = (rest.method || 'GET').toUpperCase();
    const isPublicPath =
      (path.includes('/hotels/') || path.includes('/restaurants/')) &&
      !path.includes('/my_hotels/') &&
      !path.includes('/summary/');

    if (method === 'GET' && isPublicPath) {
      const cleanHeaders = { ...(headers as Record<string, string>) };
      delete cleanHeaders['Authorization'];
      return apiClient<T>(path, {
        ...rest,
        headers: cleanHeaders,
        token: undefined,
        _isRetry: true,
      });
    }
  }

  if (!response.ok) {
    const fallback = `Request failed (HTTP ${response.status})`;
    let errorDetail = fallback;
    try {
      const errJson: unknown = await response.json();
      errorDetail = extractErrorMessage(errJson, fallback);
    } catch {
      try {
        const errText = await response.text();
        if (errText && !errText.trim().startsWith('<')) {
          errorDetail = errText.trim();
        }
      } catch {
        // Keep fallback
      }
    }
    throw new Error(errorDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
