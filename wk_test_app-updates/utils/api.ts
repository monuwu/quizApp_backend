// utils/api.ts
// Helper for making authenticated API requests

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { token } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
