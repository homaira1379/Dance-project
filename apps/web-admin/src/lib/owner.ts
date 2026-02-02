import { apiFetch } from "./apiFetch";

export type Studio = { uuid: string; name: string };
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
  trainer?: string | null;

  studio_details?: { uuid: string; name: string; address?: string; city?: string };
  trainer_details?: { uuid: string; username: string; first_name?: string; last_name?: string };
};

export type Booking = {
  uuid: string;
  status?: string;
  appointment_slot?: string;
  appointment_slot_details?: any;
  created_at?: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

// -------------------- STUDIOS --------------------
export async function listOwnerStudios(): Promise<Studio[]> {
  const res = await apiFetch<Paginated<any>>("/api/v1/studios/studios/");
  return (res.results || []).map((s) => ({ uuid: s.uuid, name: s.name }));
}

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
  studio?: string;
}): Promise<Trainer> {
  return apiFetch<Trainer>("/api/v1/studios/trainers/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function linkTrainerToStudio(studioUuid: string, trainerUuid: string) {
  return apiFetch("/api/v1/studios/trainers/", {
    method: "POST",
    body: JSON.stringify({ studio: studioUuid, trainer: trainerUuid }),
  });
}

export async function addTrainerToStudio(
  studioUuid: string,
  payload: { username: string; email?: string; first_name?: string; last_name?: string; password: string },
) {
  try {
    return await createTrainerUser({ ...payload, studio: studioUuid });
  } catch {
    const trainer = await createTrainerUser(payload);
    await linkTrainerToStudio(studioUuid, trainer.uuid);
    return trainer;
  }
}

export async function listStudioTrainers(studioUuid: string): Promise<Trainer[]> {
  const res = await apiFetch<Paginated<any>>(
    `/api/v1/studios/trainers/?studio=${encodeURIComponent(studioUuid)}`,
  );
  return (res.results || []).map((t) => ({
    uuid: t.uuid,
    username: t.username,
    email: t.email,
    first_name: t.first_name,
    last_name: t.last_name,
  }));
}

export async function removeTrainerFromStudio(studioUuid: string, trainerUuid: string) {
  return apiFetch(`/api/v1/studios/trainers/${encodeURIComponent(trainerUuid)}/`, { method: "DELETE" });
}

export async function addTrainer(studioUuid: string, payload: any) {
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
  const res = await apiFetch<Paginated<Slot>>(`/api/v1/studios/slots/${qs}`);
  return res.results || [];
}

export async function createSlot(payload: {
  studio: string;
  trainer?: string;
  title: string;
  start_time: string;
  end_time: string;
  price?: number;
}) {
  return apiFetch<Slot>("/api/v1/studios/slots/", { method: "POST", body: JSON.stringify(payload) });
}

// ✅ NEW: update slot (PATCH)
export async function updateSlot(
  slotUuid: string,
  payload: Partial<{
    title: string;
    trainer: string | null;
    start_time: string;
    end_time: string;
    price: number;
  }>,
) {
  return apiFetch<Slot>(`/api/v1/studios/slots/${encodeURIComponent(slotUuid)}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// -------------------- BOOKINGS --------------------
export async function listBookings(params?: { studio?: string }) {
  const qs = params?.studio ? `?studio=${encodeURIComponent(params.studio)}` : "";
  const res = await apiFetch<Paginated<Booking>>(`/api/v1/studios/bookings/${qs}`);
  return res.results || [];
}
