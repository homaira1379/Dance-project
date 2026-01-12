import axios from "axios";

// ✅ Use ONE env var everywhere
const API_HOST =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dance.arlidi.dev";

// ✅ Backend base is: https://dance.arlidi.dev/api/v1
const API_BASE_URL = `${API_HOST.replace(/\/$/, "")}/api/v1`;

// Token storage keys
const ACCESS_KEY = "dance_access_token";
const REFRESH_KEY = "dance_refresh_token";

export function getTokens(): { access?: string; refresh?: string } {
  if (typeof window === "undefined") return {};
  return {
    access: localStorage.getItem(ACCESS_KEY) || undefined,
    refresh: localStorage.getItem(REFRESH_KEY) || undefined,
  };
}

/**
 * ✅ Compatibility export
 * Needed because some files import getStoredTokens
 */
export function getStoredTokens(): { access?: string; refresh?: string } {
  return getTokens();
}

export function getAccessToken(): string | undefined {
  return getTokens().access;
}

export function setTokens(tokens: { access: string; refresh: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ✅ Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },

  // ✅ IMPORTANT if backend uses cookies/session auth
  // (Even if you also use Bearer tokens, this doesn't hurt.)
  withCredentials: true,
});

// ✅ Attach access token to every request (for JWT setups)
api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${access}`;
  }
  return config;
});

// ===== Token refresh handling =====
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function runRefreshQueue(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;

    // If not 401, just fail
    if (!error?.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (original?._retry) return Promise.reject(error);
    original._retry = true;

    const { refresh } = getTokens();
    if (!refresh) {
      clearTokens();
      return Promise.reject(error);
    }

    // If refresh already in progress, wait
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newAccess) => {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      // ✅ Refresh endpoint
      const refreshRes = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        { refresh },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ keep consistent
        }
      );

      const newTokens = refreshRes.data as { access: string; refresh?: string };
      const finalTokens = {
        access: newTokens.access,
        refresh: newTokens.refresh || refresh,
      };

      setTokens(finalTokens);
      runRefreshQueue(finalTokens.access);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${finalTokens.access}`;
      return api(original);
    } catch (e) {
      clearTokens();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
