// apps/web-admin/src/lib/classes.ts
"use client";

import { apiFetch } from "./apiFetch";

export type DanceLevel = "beginner" | "intermediate" | "advanced" | "all";

export type ClassEvent = {
  id: string;

  studioId: string;
  studioName?: string;
  city?: string;

  title: string;

  teacherId: string;
  teacherName?: string;

  styleId?: string;
  styleName?: string;

  locationName: string;
  level: DanceLevel;

  description?: string;

  price: number;
  capacity: number;
  reservedCount?: number;

  startAt: number;
  endAt: number;
};

type SlotResponse = {
  uuid: string;
  title: string;
  description?: string;

  studio?: string;
  studio_details?: { uuid?: string; name?: string; city?: string; address?: string };

  trainer?: string | null;
  trainer_details?: {
    trainer_details?: { first_name?: string; last_name?: string };
  } | null;

  dance_style?: string | null;
  dance_style_details?: { uuid?: string; name?: string } | null;

  start_time: string;
  end_time: string;

  price: string;
  max_participants: number;
  current_bookings?: number;
};

function mapSlotToClass(slot: SlotResponse): ClassEvent {
  const first = slot.trainer_details?.trainer_details?.first_name ?? "";
  const last = slot.trainer_details?.trainer_details?.last_name ?? "";
  const trainerName = `${first} ${last}`.trim() || undefined;

  const studioId = slot.studio_details?.uuid || slot.studio || "studio";
  const studioName = slot.studio_details?.name || undefined;
  const city = slot.studio_details?.city || undefined;

  const styleId = slot.dance_style || undefined;
  const styleName = slot.dance_style_details?.name || undefined;

  return {
    id: slot.uuid,

    studioId,
    studioName,
    city,

    title: slot.title,

    teacherId: slot.trainer || "",
    teacherName: trainerName,

    styleId,
    styleName,

    locationName:
      slot.studio_details?.address ||
      slot.studio_details?.city ||
      slot.studio_details?.name ||
      "Studio",

    level: "all",
    description: slot.description,

    price: Number(slot.price || 0),
    capacity: slot.max_participants,
    reservedCount: slot.current_bookings ?? 0,

    startAt: new Date(slot.start_time).getTime(),
    endAt: new Date(slot.end_time).getTime(),
  };
}

function toQueryString(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function fetchClasses(params?: {
  trainer?: string;
  studio?: string;
  dance_style?: string;

  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD

  min_price?: number;
  max_price?: number;

  available_only?: boolean;

  // UI-only search (client-side)
  search?: string;
}) {
  const query = toQueryString({
    trainer: params?.trainer,
    studio: params?.studio,
    dance_style: params?.dance_style,
    start_date: params?.start_date,
    end_date: params?.end_date,
    min_price: params?.min_price,
    max_price: params?.max_price,
    available_only: params?.available_only ?? false,
  });

  const data = await apiFetch<any>(`/api/v1/studios/slots/${query}`, { method: "GET" });

  const slots: SlotResponse[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  let mapped = slots.map(mapSlotToClass);

  // client-side search (backend doesn't support search)
  const q = (params?.search || "").trim().toLowerCase();
  if (q) {
    mapped = mapped.filter((c) => {
      const hay = [c.title, c.teacherName, c.studioName, c.city, c.styleName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return mapped;
}
