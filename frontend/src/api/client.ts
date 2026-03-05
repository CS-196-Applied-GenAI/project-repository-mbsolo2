const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | unknown[];
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, ...rest } = options;
  const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
