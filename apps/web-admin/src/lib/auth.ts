"use client";

import { api, clearTokens, setTokens } from "./api";

export type UserRole = "owner" | "instructor" | "student";

/** Backend roles we expect (but backend can vary, so we parse flexibly). */
type ApiRole =
  | "STUDIO_OWNER"
  | "TRAINER"
  | "CLIENT"
  | "OWNER"
  | "INSTRUCTOR"
  | "STUDENT";

const roleMap: Record<UserRole, ApiRole> = {
  owner: "STUDIO_OWNER",
  instructor: "TRAINER",
  student: "CLIENT",
};

export type AccountProfile = {
  uuid: string;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone_number?: string | null;

  // Backend sometimes sends any of these:
  roles?: unknown; // string | string[] | {name:string}[] | etc.
  role?: unknown;  // string
  user_type?: unknown;

  gender?: string;
  dance_level?: string;
  interests?: string[];
};

function normalizeRoles(input: unknown): string[] {
  if (!input) return [];

  // string: "TRAINER,CLIENT" or "TRAINER"
  if (typeof input === "string") return [input];

  // array: ["TRAINER"] or [{name:"TRAINER"}]
  if (Array.isArray(input)) {
    return input
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object" && "name" in x) return String((x as any).name);
        return "";
      })
      .filter(Boolean);
  }

  // object: {name:"TRAINER"} or {role:"TRAINER"}
  if (typeof input === "object") {
    const obj = input as any;
    if (obj.name) return [String(obj.name)];
    if (obj.role) return [String(obj.role)];
  }

  return [];
}

/** ✅ Robust: works with profile.roles OR profile.role OR profile.user_type */
export function toUserRole(rolesOrAnything?: unknown): UserRole {
  const roles = normalizeRoles(rolesOrAnything).join(" ").toUpperCase();

  // Owner
  if (roles.includes("STUDIO_OWNER") || roles.includes("OWNER")) return "owner";

  // Instructor
  if (roles.includes("TRAINER") || roles.includes("INSTRUCTOR")) return "instructor";

  // Student
  if (roles.includes("CLIENT") || roles.includes("STUDENT")) return "student";

  // Default
  return "student";
}

export async function signUpWithEmail(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  gender?: string;
}) {
  const payload = {
    username: input.email.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    phone_number: input.phone?.trim() || "",
    password: input.password,
    role: roleMap[input.role], // ✅ send backend role
    gender: input.gender || "F",
  };

  await api.post("/auth/registration/", payload);

  // Sign in to obtain tokens
  return signInWithEmail({ email: input.email, password: input.password });
}

export async function signInWithEmail(params: { email: string; password: string }) {
  const res = await api.post("/auth/login/", {
    username: params.email.trim(),
    password: params.password,
  });

  const tokens = res.data as { access: string; refresh: string };
  setTokens(tokens);

  const profile = await fetchProfile();

  // ✅ derive role from any possible role fields
  const role = toUserRole(profile.roles ?? profile.role ?? profile.user_type);
  return { user: profile, role };
}

export async function signOut() {
  clearTokens();
}

export async function sendResetPassword(username: string) {
  await api.post("/auth/password-reset-form/", { username });
}

export async function confirmPasswordReset(code: string, password: string) {
  await api.post("/auth/password-reset-confirm/", { code, password });
}

export async function fetchProfile(): Promise<AccountProfile> {
  const res = await api.get("/auth/my_account/");
  return res.data as AccountProfile;
}

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  danceLevel?: string;
  interests?: string[];
}) {
  const res = await api.patch("/auth/my_account/", {
    first_name: input.firstName,
    last_name: input.lastName,
    phone_number: input.phone,
    gender: input.gender,
    dance_level: input.danceLevel,
    interests: input.interests,
  });
  return res.data as AccountProfile;
}
