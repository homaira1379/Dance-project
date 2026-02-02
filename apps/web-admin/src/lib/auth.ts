"use client";

import { apiFetch } from "./apiFetch";
import { setTokens, clearTokens } from "./api";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export type UserRole = "owner" | "instructor" | "student";

export type AccountProfile = {
  uuid: string;
  username: string;
  email?: string;

  // backend variations
  role?: string;
  roles?: any;
  user_type?: any;
  userType?: any;

  // profile fields
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: string;
  dance_level?: string;
  interests?: string[];
};

export type AuthUser = AccountProfile;

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function pickRoleValue(raw: any): any {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.name ?? first.role ?? first.type ?? null;
    return String(first);
  }

  if (typeof raw === "object") {
    return raw.name ?? raw.role ?? raw.type ?? null;
  }

  return raw;
}

export function toUserRole(raw: any): UserRole | null {
  const v = String(raw || "").toLowerCase();
  if (!v) return null;

  if (v.includes("owner")) return "owner";
  if (v.includes("trainer") || v.includes("instructor")) return "instructor";
  if (v.includes("student")) return "student";

  return null;
}

function roleToDashboard(role: UserRole | null): string {
  if (role === "owner") return "/dashboard/owner";
  if (role === "instructor") return "/dashboard/instructor";
  return "/dashboard/student";
}

function resolveRole(profile: AccountProfile): UserRole | null {
  const rawRole =
    pickRoleValue((profile as any).roles) ??
    pickRoleValue((profile as any).role) ??
    pickRoleValue((profile as any).user_type) ??
    pickRoleValue((profile as any).userType);

  return toUserRole(rawRole);
}

/**
 * Extract JWT tokens from different backend response shapes.
 * Supports common patterns:
 * - { access, refresh }
 * - { access_token, refresh_token }
 * - { token, refresh }
 * - { tokens: { access, refresh } }
 * - { data: { access, refresh } }
 */
function extractTokens(res: any): { access?: string; refresh?: string } {
  if (!res) return {};

  const directAccess =
    res.access ||
    res.access_token ||
    res.token ||
    res.jwt ||
    res?.data?.access ||
    res?.data?.access_token ||
    res?.data?.token ||
    res?.data?.jwt;

  const directRefresh =
    res.refresh ||
    res.refresh_token ||
    res?.data?.refresh ||
    res?.data?.refresh_token;

  const nested = res.tokens || res?.data?.tokens;

  const nestedAccess = nested?.access || nested?.access_token || nested?.token || nested?.jwt;
  const nestedRefresh = nested?.refresh || nested?.refresh_token;

  const access = directAccess || nestedAccess;
  const refresh = directRefresh || nestedRefresh;

  return {
    access: access ? String(access) : undefined,
    refresh: refresh ? String(refresh) : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Core auth API */
/* ------------------------------------------------------------------ */

export async function fetchProfile(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/v1/auth/my_account/");
}

export async function myAccount(): Promise<AccountProfile> {
  return fetchProfile();
}

/**
 * Login
 * - sends BOTH username + email (backend can accept either)
 * - stores JWT tokens if returned (supports multiple response formats)
 */
export async function login(payload: { username: string; password: string }) {
  const loginRes = await apiFetch<any>("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      email: payload.username, // allow email input
      password: payload.password,
    }),
  });

  const { access, refresh } = extractTokens(loginRes);

  if (!access) {
    clearTokens();
    throw new Error(
      "Login succeeded but backend did not return an access token. Check /api/v1/auth/login/ response in Swagger.",
    );
  }

  setTokens({ access, refresh });

  const profile = await fetchProfile();
  const role = resolveRole(profile);

  return {
    me: profile,
    role,
    redirectTo: roleToDashboard(role),
  };
}

/**
 * Register
 * - stores JWT tokens if returned (supports multiple response formats)
 */
export async function register(payload: {
  username: string;
  email?: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const regRes = await apiFetch<any>("/api/v1/auth/registration/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const { access, refresh } = extractTokens(regRes);

  // Some backends don't auto-login on registration; only store if provided.
  if (access) setTokens({ access, refresh });

  const profile = await fetchProfile();
  const role = resolveRole(profile);

  return {
    me: profile,
    role,
    redirectTo: roleToDashboard(role),
  };
}

/**
 * Logout
 * NOTE: If backend doesn't support logout endpoint, we just clear tokens locally.
 */
export async function logout() {
  clearTokens();
}

/* ------------------------------------------------------------------ */
/* Profile update (USED BY profile/page.tsx) */
/* ------------------------------------------------------------------ */

export async function updateProfile(payload: {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: string;
  dance_level?: string;
  interests?: string[];
}) {
  return apiFetch<AccountProfile>("/api/v1/auth/my_account/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ */
/* Compatibility exports (UI expects these names) */
/* ------------------------------------------------------------------ */

export async function signInWithEmail(payload: { email: string; password: string }) {
  return login({
    username: payload.email,
    password: payload.password,
  });
}

export async function signUpWithEmail(payload: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}) {
  const username =
    payload.username?.trim() ||
    String(payload.email || "")
      .split("@")[0]
      .replace(/[^a-zA-Z0-9._-]/g, "") ||
    "user";

  return register({
    username,
    email: payload.email,
    password: payload.password,
    first_name: payload.first_name,
    last_name: payload.last_name,
  });
}

export async function sendResetPassword(email: string) {
  await apiFetch("/api/v1/auth/password/reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function signOut() {
  return logout();
}
