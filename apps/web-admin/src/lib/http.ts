// apps/web-admin/src/lib/http.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dance.arlidi.dev";

type Json = Record<string, any>;

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}
