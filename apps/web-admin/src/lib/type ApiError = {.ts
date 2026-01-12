type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dance.arlidi.dev";
const MOCK = process.env.NEXT_PUBLIC_API_MOCK === "1";

function getToken() {
  // Adjust to your app: localStorage, cookies, next-auth, etc.
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function parseError(res: Response): Promise<ApiError> {
  let body: any = null;
  try { body = await res.json(); } catch {}
  return {
    status: res.status,
    message: body?.detail || body?.message || res.statusText || "Request failed",
    details: body,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  // Mock mode: you can short-circuit specific endpoints here
  if (MOCK) {
    // Example: mock trainers create/list
    if (path.startsWith("/api/v1/studios/trainers/")) {
      // naive mock response
      // You can refine this later to match real backend shape
      return (await mockTrainers<T>(path, options)) as T;
    }
  }

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await parseError(res);
    // Optional: central 401 handling
    if (err.status === 401 && typeof window !== "undefined") {
      // e.g. redirect to /login
      window.location.href = "/login";
    }
    throw err;
  }

  return (await res.json()) as T;
}

// --- Mock helpers (temporary) ---
let mockTrainerStore: any[] = [];

async function mockTrainers<T>(path: string, options: RequestInit) {
  const method = (options.method || "GET").toUpperCase();

  if (method === "GET") {
    return { results: mockTrainerStore, count: mockTrainerStore.length } as any;
  }

  if (method === "POST") {
    const body = options.body ? JSON.parse(String(options.body)) : {};
    const created = {
      id: crypto.randomUUID(),
      ...body,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockTrainerStore = [created, ...mockTrainerStore];
    return created as any;
  }

  throw { status: 405, message: "Method not allowed in mock" };
}
