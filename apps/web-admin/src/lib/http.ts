// apps/web-admin/src/lib/http.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dance.arlidi.dev";

type Json = Record<string, any>;

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (path.startsWith("http")) return path;
  if (base.endsWith("/") && path.startsWith("/")) return base + path.slice(1);
  if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
  return base + path;
}

async function parseBody(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Simple GET helper
 * ✅ Includes credentials so Django session auth works.
 */
export async function apiGet<T = Json>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = joinUrl(API_BASE_URL, path);

  const res = await fetch(url, {
    ...init,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include", // ✅ IMPORTANT
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await parseBody(res);
    const msg =
      (data && (data.detail || data.message)) ||
      (typeof data === "string" ? data : "") ||
      res.statusText;
    throw new Error(`GET ${path} failed (${res.status}): ${msg}`);
  }

  return (await res.json()) as T;
}
