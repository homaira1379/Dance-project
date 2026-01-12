"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchProfile,
  type AccountProfile,
  toUserRole,
  type UserRole,
} from "./auth";
import { getStoredTokens, clearTokens } from "./api";

type AuthUserState = {
  user: AccountProfile | null;
  role: UserRole | null;
  loading: boolean;
};

function pickRoleValue(raw: any): any {
  if (!raw) return null;

  // roles: ["student"] or [{ name: "student" }]
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.name ?? first.role ?? first.type ?? null;
    return String(first);
  }

  // roles: { name: "student" }
  if (typeof raw === "object") {
    return raw.name ?? raw.role ?? raw.type ?? null;
  }

  // roles: "student"
  return raw;
}

export function useAuthUser(): AuthUserState {
  const [state, setState] = useState<AuthUserState>({
    user: null,
    role: null,
    loading: true,
  });

  const load = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setState({ user: null, role: null, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    try {
      const profile = await fetchProfile();

      // Try multiple backend shapes:
      const rawRole =
        pickRoleValue((profile as any).roles) ??
        pickRoleValue((profile as any).role) ??
        pickRoleValue((profile as any).user_type) ??
        pickRoleValue((profile as any).userType);

      const role = toUserRole(rawRole);

      setState({
        user: profile,
        role,
        loading: false,
      });
    } catch (err) {
      clearTokens();
      setState({ user: null, role: null, loading: false });
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const safeLoad = async () => {
      if (!alive) return;
      await load();
    };

    safeLoad();

    // Re-run if tokens are updated in localStorage (login/logout in another tab)
    const onStorage = (e: StorageEvent) => {
      // If your token keys are known, you can narrow this check further
      if (e.key && e.key.toLowerCase().includes("token")) {
        safeLoad();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  return state;
}
