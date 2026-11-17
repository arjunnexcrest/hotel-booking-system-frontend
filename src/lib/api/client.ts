const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type RequestOptions = RequestInit & {
  token?: string;
};

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
    let errorDetail = `API error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
      else if (errJson.error) errorDetail = errJson.error;
      else errorDetail = JSON.stringify(errJson);
    } catch {
      const errText = await response.text();
      if (errText) errorDetail = errText;
    }
    throw new Error(errorDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
