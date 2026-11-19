const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type RequestOptions = RequestInit & {
  token?: string;
};

function formatFieldLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function flattenErrorValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => flattenErrorValue(item))
      .filter(Boolean)
      .join(' ');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const text = flattenErrorValue(v);
        if (!text) return '';
        if (k === 'detail' || k === 'non_field_errors' || k === 'error') {
          return text;
        }
        return `${formatFieldLabel(k)}: ${text}`;
      })
      .filter(Boolean)
      .join(' • ');
  }
  return '';
}

function extractErrorMessage(errJson: unknown, fallback: string): string {
  if (!errJson || typeof errJson !== 'object') {
    return typeof errJson === 'string' && errJson.trim() ? errJson : fallback;
  }

  const obj = errJson as Record<string, unknown>;

  // 1. Django custom_exception_handler envelope: { success, status_code, message, errors }
  if (obj.errors !== undefined && obj.errors !== null) {
    const parsedErrors = flattenErrorValue(obj.errors);
    if (parsedErrors) return parsedErrors;
  }

  // 2. Standard DRF / custom keys
  for (const key of ['detail', 'error', 'message']) {
    if (typeof obj[key] === 'string' && (obj[key] as string).trim()) {
      return obj[key] as string;
    }
  }

  // 3. Direct field validation dictionary
  const flattened = flattenErrorValue(obj);
  return flattened || fallback;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

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
