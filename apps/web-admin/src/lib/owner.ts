// apps/web-admin/src/lib/owner.ts
import { apiFetch } from "./apiFetch";

export type Studio = {
  uuid: string;
  name: string;

  // optional extras (if backend provides them)
  city?: string;
  address?: string;
  two_gis_url?: string;
  instagram_username?: string;
  instagram_url?: string;
};

export type Trainer = {
  uuid: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type Slot = {
  uuid: string;
  title?: string;
  start_time: string;
  end_time: string;
  price?: number | string;

  studio?: string;
  trainer?: string;

  studio_details?: { uuid: string; name: string };
  trainer_details?: { uuid: string; username: string; first_name?: string; last_name?: string };
};

export type Booking = {
  uuid: string;
  status?: string;
  appointment_slot?: string;

  appointment_slot_details?: {
    uuid: string;
    title?: string;
    start_time?: string;
    end_time?: string;
    price?: number | string;
    studio_details?: { uuid: string; name: string };
    trainer_details?: { uuid: string; username: string; first_name?: string; last_name?: string };
  };

  created_at?: string;
};

type Paginated<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

// ==================== BACKEND PATHS ====================
// According to backend index (/api/v1/studios/) the real resources are:
const STUDIOS_BASE = "/api/v1/studios";
const STUDIOS_LIST = `${STUDIOS_BASE}/studios/`;
const TRAINERS_LINKS = `${STUDIOS_BASE}/trainers/`;
const SLOTS = `${STUDIOS_BASE}/slots/`;
const BOOKINGS = `${STUDIOS_BASE}/bookings/`;

// -------------------- STUDIOS --------------------
export async function listOwnerStudios(): Promise<Studio[]> {
  // ✅ FIX: was "/api/v1/studios/" (index), must be "/api/v1/studios/studios/"
  const res = await apiFetch<Paginated<any>>(STUDIOS_LIST);

  const rows = res?.results ?? [];
  return rows.map((s: any) => ({
    uuid: s.uuid,
    name: s.name,

    // optional fields if backend returns them
    city: s.city,
    address: s.address,
    two_gis_url: s.two_gis_url,
    instagram_username: s.instagram_username,
    instagram_url: s.instagram_url,
  }));
}

// alias (some UI imports myStudios)
export async function myStudios(): Promise<Studio[]> {
  return listOwnerStudios();
}

// -------------------- TRAINERS --------------------
// IMPORTANT:
// Many backends do NOT allow creating trainer users from owner UI.
// If your backend supports it, keep it. If not, your backend friend will adjust.
export async function createTrainerUser(payload: {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password: string;
}): Promise<Trainer> {
  // ✅ FIX: backend index suggests trainers resource is /api/v1/studios/trainers/
  return apiFetch<Trainer>(TRAINERS_LINKS, {
    method: "POST",
    body: payload,
  });
}

export async function linkTrainerToStudio(studioUuid: string, trainerUuid: string) {
  // Some backends link trainer-to-studio by POSTing {studio, trainer} to same endpoint
  return apiFetch(TRAINERS_LINKS, {
    method: "POST",
    body: { studio: studioUuid, trainer: trainerUuid },
  });
}

export async function addTrainerToStudio(
  studioUuid: string,
  payload: {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password: string;
  }
) {
  const trainer = await createTrainerUser(payload);
  // If backend already links trainer to studio on creation, this might be redundant — but safe
  await linkTrainerToStudio(studioUuid, trainer.uuid);
  return trainer;
}

export async function listStudioTrainers(studioUuid: string): Promise<Trainer[]> {
  // ✅ FIX: trainers are under /api/v1/studios/trainers/
  const res = await apiFetch<Paginated<any>>(
    `${TRAINERS_LINKS}?studio=${encodeURIComponent(studioUuid)}`
  );

  return (res.results ?? []).map((row: any) => {
    // Backend may return either {trainer: {...}} or trainer object directly
    const t = row.trainer ?? row;
    return {
      uuid: t.uuid,
      username: t.username,
      email: t.email,
      first_name: t.first_name,
      last_name: t.last_name,
    };
  });
}

export async function removeTrainerFromStudio(studioUuid: string, trainerUuid: string) {
  // Different backends delete differently — keep fallback logic
  try {
    return await apiFetch(`${TRAINERS_LINKS}remove/`, {
      method: "POST",
      body: { studio: studioUuid, trainer: trainerUuid },
    });
  } catch {
    // try DELETE a specific relation or trainer record
    return apiFetch(`${TRAINERS_LINKS}${encodeURIComponent(trainerUuid)}/`, {
      method: "DELETE",
    });
  }
}

// compatibility wrappers for older UI imports
export async function addTrainer(
  studioUuid: string,
  payload: {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password: string;
  }
) {
  return addTrainerToStudio(studioUuid, payload);
}

export async function listTrainers(studioUuid: string) {
  if (!studioUuid) return [];
  return listStudioTrainers(studioUuid);
}

export async function removeTrainer(studioUuid: string, trainerUuid: string) {
  return removeTrainerFromStudio(studioUuid, trainerUuid);
}

// -------------------- SLOTS --------------------
export async function listSlots(params?: { studio?: string }) {
  // ✅ FIX: slots are under /api/v1/studios/slots/
  const qs = params?.studio ? `?studio=${encodeURIComponent(params.studio)}` : "";
  const res = await apiFetch<Paginated<Slot>>(`${SLOTS}${qs}`);
  return res.results ?? [];
}

export async function createSlot(payload: {
  studio: string;
  trainer?: string; // optional
  title: string;
  start_time: string;
  end_time: string;
  price?: number;
}) {
  // ✅ FIX: create slot at /api/v1/studios/slots/
  return apiFetch<Slot>(SLOTS, {
    method: "POST",
    body: payload,
  });
}

// -------------------- BOOKINGS --------------------
export async function listBookings(params?: { studio?: string }) {
  // ✅ FIX: bookings are under /api/v1/studios/bookings/
  const qs = params?.studio ? `?studio=${encodeURIComponent(params.studio)}` : "";
  const res = await apiFetch<Paginated<Booking>>(`${BOOKINGS}${qs}`);
  return res.results ?? [];
}
