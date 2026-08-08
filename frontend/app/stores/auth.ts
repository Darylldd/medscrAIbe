interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = useLocalStorage<string | null>('medscribe_refresh_token', null);
  const user = ref<AuthUser | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  async function login(email: string, password: string) {
    const { request } = useApi();
    const tokens = await request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;

    await fetchCurrentUser();
  }

  async function fetchCurrentUser() {
    if (!accessToken.value) return;

    const { request } = useApi();
    user.value = await request<AuthUser>('/users/me', {
      token: accessToken.value,
    });
  }

  async function tryRefresh(): Promise<boolean> {
    if (!refreshToken.value) return false;

    try {
      const { request } = useApi();
      const tokens = await request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value },
      });

      accessToken.value = tokens.accessToken;
      refreshToken.value = tokens.refreshToken;

      await fetchCurrentUser();
      return true;
    } catch {
      logout();
      return false;
    }
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    fetchCurrentUser,
    tryRefresh,
    logout,
  };
});