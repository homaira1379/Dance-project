import { api, clearTokens, setTokens } from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MobileUserRole = "owner" | "instructor" | "student";

type ApiRole = "STUDIO_OWNER" | "TRAINER" | "CLIENT";

const roleMap: Record<MobileUserRole, ApiRole> = {
  owner: "STUDIO_OWNER",
  instructor: "TRAINER",
  student: "CLIENT",
};
const ROLE_KEY = "dancecrm.role";

export type AccountProfile = {
  uuid: string;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  roles?: string;
  dance_level?: string;
  interests?: string[];
};

function toMobileRole(apiRole?: string): MobileUserRole {
  if (apiRole?.includes("STUDIO_OWNER")) return "owner";
  if (apiRole?.includes("TRAINER")) return "instructor";
  return "student";
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  role?: MobileUserRole;
}) {
  const role = input.role ?? "student";
  const payload = {
    username: input.email.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    gender: input.gender?.trim() || "M",
    phone_number: input.phone?.trim() || "",
    password: input.password,
    role: roleMap[role],
  };

  const res = await api.post("/auth/registration/", payload);
  // Registration may not return tokens; if none, follow up with login
  const tokens = (res.data as any) as { access?: string; refresh?: string };
  if (tokens.access && tokens.refresh) {
    await setTokens({ access: tokens.access, refresh: tokens.refresh });
  }
  return res.data;
}

export async function login(emailOrUsername: string, password: string) {
  const res = await api.post("/auth/login/", {
    username: emailOrUsername.trim(),
    password,
  });
  const tokens = res.data as { access: string; refresh: string };
  await setTokens(tokens);
  const profile = await fetchProfile();
  const role = toMobileRole(profile.roles);
  await setStoredRole(role);
  return { profile, role };
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
  const payload = {
    first_name: input.firstName,
    last_name: input.lastName,
    phone_number: input.phone,
    gender: input.gender,
    dance_level: input.danceLevel,
    interests: input.interests,
  };
  const res = await api.patch("/auth/my_account/", payload);
  return res.data as AccountProfile;
}

export async function logout() {
  await clearTokens();
  await clearStoredRole();
}

export async function setStoredRole(role: MobileUserRole) {
  await AsyncStorage.setItem(ROLE_KEY, role);
}

export async function getStoredRole(): Promise<MobileUserRole | null> {
  const raw = await AsyncStorage.getItem(ROLE_KEY);
  if (raw === "owner" || raw === "instructor" || raw === "student") {
    return raw;
  }
  return null;
}

export async function clearStoredRole() {
  await AsyncStorage.removeItem(ROLE_KEY);
}

export async function requestPasswordReset(username: string) {
  await api.post("/auth/password-reset-form/", { username });
}

export async function confirmPasswordReset(code: string, password: string) {
  await api.post("/auth/password-reset-confirm/", { code, password });
}
