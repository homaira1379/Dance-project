// apps/web-admin/src/lib/apiFetch.ts
"use client";

import {
  API_HOST,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./api";

function joinUrl(base: string, path: string) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function readError(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.detail ? String(j.detail) : JSON.stringify(j);
    }
  } catch {}
  try {
    const t = await res.text();
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = joinUrl(API_HOST, path);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    Accept: "application/json",
  };

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const access = getAccessToken();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: "omit",
    });
  } catch (e: any) {
    throw new Error(
      e?.message || `Failed to fetch ${url}. Check NEXT_PUBLIC_API_HOST and CORS.`,
    );
  }

  // refresh once on 401
  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      throw new Error(await readError(res));
    }

    const refreshRes = await fetch(joinUrl(API_HOST, "/api/v1/auth/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      credentials: "omit",
    });

    if (!refreshRes.ok) {
      clearTokens();
      throw new Error(await readError(refreshRes));
    }

    const newTokens = (await refreshRes.json()) as { access: string; refresh?: string };
    setTokens({ access: newTokens.access, refresh: newTokens.refresh || refresh });

    const retryRes = await fetch(url, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newTokens.access}` },
      credentials: "omit",
    });

    if (!retryRes.ok) throw new Error(await readError(retryRes));
    if (retryRes.status === 204) return undefined as T;

    const ct = retryRes.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return undefined as unknown as T;
    return (await retryRes.json()) as T;
  }

  if (!res.ok) throw new Error(await readError(res));
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as unknown as T;

  return (await res.json()) as T;
}
