export function useApi() {
  const config = useRuntimeConfig();

  async function request<T>(
    path: string,
    options: { method?: string; body?: unknown; token?: string } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${config.public.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorBody.message ?? `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  return { request };
}