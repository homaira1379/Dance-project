"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchProfile, toUserRole, type AccountProfile, type UserRole } from "./auth";

type AuthUserState = {
  user: AccountProfile | null;
  role: UserRole | null;
  loading: boolean;
};

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

function isUnauthorized(err: any) {
  // apiFetch throws Error(message), so we detect by message content
  const msg = String(err?.message || "").toLowerCase();
  return msg.includes("authentication credentials were not provided") || msg.includes("unauthorized") || msg.includes("401");
}

export function useAuthUser(): AuthUserState {
  const [state, setState] = useState<AuthUserState>({
    user: null,
    role: null,
    loading: true,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));

    try {
      const profile = await fetchProfile();

      const rawRole =
        pickRoleValue((profile as any).roles) ??
        pickRoleValue((profile as any).role) ??
        pickRoleValue((profile as any).user_type) ??
        pickRoleValue((profile as any).userType);

      const role = toUserRole(rawRole);

      setState({ user: profile, role, loading: false });
    } catch (err: any) {
      // ✅ If not logged in, just show logged-out state (NO scary error)
      if (isUnauthorized(err)) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      // Real error (server down etc.)
      setState({ user: null, role: null, loading: false });
      console.error("Auth load error:", err);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [load]);

  return state;
}
