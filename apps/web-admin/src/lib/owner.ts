// apps/web-admin/src/lib/owner.ts
import { apiFetch } from "./apiFetch";

export type Studio = {
  uuid: string;
  name: string;
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
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// -------------------- STUDIOS --------------------
export async function listOwnerStudios(): Promise<Studio[]> {
  const res = await apiFetch<Paginated<any>>("/api/v1/studios/");
  return (res.results || []).map((s) => ({
    uuid: s.uuid,
    name: s.name,
  }));
}

// alias (some UI imports myStudios)
export async function myStudios(): Promise<Studio[]> {
  return listOwnerStudios();
}

// -------------------- TRAINERS --------------------
export async function createTrainerUser(payload: {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password: string;
}): Promise<Trainer> {
  return apiFetch<Trainer>("/api/v1/trainers/", {
    method: "POST",
    body: payload,
  });
}

export async function linkTrainerToStudio(studioUuid: string, trainerUuid: string) {
  return apiFetch("/api/v1/studios/trainers/", {
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
  await linkTrainerToStudio(studioUuid, trainer.uuid);
  return trainer;
}

export async function listStudioTrainers(studioUuid: string): Promise<Trainer[]> {
  const res = await apiFetch<Paginated<any>>(
    `/api/v1/studios/trainers/?studio=${encodeURIComponent(studioUuid)}`
  );

  return (res.results || []).map((row) => {
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
  try {
    return await apiFetch("/api/v1/studios/trainers/remove/", {
      method: "POST",
      body: { studio: studioUuid, trainer: trainerUuid },
    });
  } catch {
    return apiFetch(`/api/v1/studios/trainers/${encodeURIComponent(trainerUuid)}/`, {
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
  const qs = params?.studio ? `?studio=${encodeURIComponent(params.studio)}` : "";
  const res = await apiFetch<{ results: Slot[] }>(`/api/v1/appointment-slots/${qs}`);
  return res.results || [];
}

export async function createSlot(payload: {
  studio: string;
  trainer?: string; // ✅ OPTIONAL (important!)
  title: string;
  start_time: string;
  end_time: string;
  price?: number;
}) {
  return apiFetch<Slot>(`/api/v1/appointment-slots/`, {
    method: "POST",
    body: payload,
  });
}

// -------------------- BOOKINGS --------------------
export async function listBookings(params?: { studio?: string }) {
  const qs = params?.studio ? `?studio=${encodeURIComponent(params.studio)}` : "";
  const res = await apiFetch<{ results: Booking[] }>(`/api/v1/bookings/${qs}`);
  return res.results || [];
}
