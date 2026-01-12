'use client';

import { api } from "./api";

export type DanceLevel = "beginner" | "intermediate" | "advanced" | "all";

export type ClassEvent = {
  id: string;
  studioId: string;
  title: string;
  teacherId: string;
  teacherName?: string;
  locationName: string;
  level: DanceLevel;
  description?: string;
  price: number;
  capacity: number;
  reservedCount?: number;
  waitlistCount?: number;
  startAt: number;
  endAt: number;
  createdAt: number;
  recurringRule?: string;
};

type SlotResponse = {
  uuid: string;
  title: string;
  description?: string;
  studio_details?: { name?: string; city?: string; address?: string };
  trainer_details?: { trainer_details?: { first_name?: string; last_name?: string } };
  start_time: string;
  end_time: string;
  price: string;
  max_participants: number;
  current_bookings?: number;
  spots_remaining?: number;
  status?: string;
};

function mapSlotToClass(slot: SlotResponse): ClassEvent {
  const trainerName =
    slot.trainer_details?.trainer_details?.first_name ||
    slot.trainer_details?.trainer_details?.last_name
      ? `${slot.trainer_details?.trainer_details?.first_name ?? ""} ${slot.trainer_details?.trainer_details?.last_name ?? ""}`.trim()
      : undefined;
  return {
    id: slot.uuid,
    studioId: slot.studio_details?.name || "studio",
    title: slot.title,
    teacherId: "",
    teacherName: trainerName,
    locationName:
      slot.studio_details?.address || slot.studio_details?.city || "Studio",
    level: "all",
    description: slot.description,
    price: Number(slot.price || 0),
    capacity: slot.max_participants,
    reservedCount: slot.current_bookings,
    waitlistCount: Math.max(
      0,
      (slot.max_participants || 0) -
        (slot.spots_remaining ?? slot.max_participants ?? 0) -
        (slot.current_bookings ?? 0),
    ),
    startAt: new Date(slot.start_time).getTime(),
    endAt: new Date(slot.end_time).getTime(),
    createdAt: Date.now(),
  };
}

export async function fetchClasses(params?: {
  trainer?: string;
  studio?: string;
  dance_style?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  available_only?: boolean;
}) {
  const res = await api.get("/studios/slots/", {
    params: {
      available_only: params?.available_only ?? false,
      trainer: params?.trainer,
      studio: params?.studio,
      dance_style: params?.dance_style,
      start_date: params?.start_date,
      end_date: params?.end_date,
      min_price: params?.min_price,
      max_price: params?.max_price,
    },
  });
  
  let slots: SlotResponse[] = [];
  if (Array.isArray(res.data)) {
    slots = res.data;
  } else if (res.data && Array.isArray((res.data as any).results)) {
    slots = (res.data as any).results;
  }

  return slots.map(mapSlotToClass);
}

export async function deleteClass(slotId: string) {
  await api.delete(`/studios/slots/${slotId}/`);
}

export type CreateClassInput = {
  studioId: string;
  title: string;
  description?: string;
  price: number;
  capacity: number;
  startAt: Date;
  endAt: Date;
  trainerId?: string;
  danceStyleId?: string;
};

export async function createClass(input: CreateClassInput) {
  const payload = {
    studio: input.studioId,
    title: input.title,
    description: input.description,
    price: input.price,
    max_participants: input.capacity,
    start_time: input.startAt.toISOString(),
    end_time: input.endAt.toISOString(),
    trainer: input.trainerId || null,
    dance_style: input.danceStyleId || null,
    status: "AVAILABLE",
  };
  const res = await api.post("/studios/slots/", payload);
  return res.data;
}
