// apps/web-admin/src/lib/slots.ts
"use client";

import { apiFetch } from "@/lib/apiFetch";

/* ------------------------------------------------------------------ */
/* Types (MATCH BACKEND EXACTLY) */
/* ------------------------------------------------------------------ */

export type Slot = {
  uuid: string;

  title: string;
  description?: string | null;

  start_time: string;
  end_time: string;
  duration_minutes: number;

  price: string;
  status: string;

  max_participants: number;
  current_bookings: number;
  spots_remaining: number;

  is_available: boolean;
  is_active: boolean;

  studio: string;
  studio_details: {
    uuid: string;
    name: string;
    address?: string;
    city?: string;
  };

  trainer?: string | null;
  trainer_details?: {
    uuid: string;
    trainer_details?: {
      first_name?: string;
      last_name?: string;
    };
  } | null;

  dance_style?: string | null;
  dance_style_details?: {
    uuid: string;
    name: string;
    code?: string;
  } | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/* ------------------------------------------------------------------ */
/* API */
/* ------------------------------------------------------------------ */

/**
 * Public slots list (used by Home Search)
 * GET /api/v1/studios/slots/
 */
export async function getSlots(params?: {
  studio?: string;
  date?: string;
  dance_style?: string;
}) {
  const qs = new URLSearchParams();

  if (params?.studio) qs.set("studio", params.studio);
  if (params?.date) qs.set("date", params.date);
  if (params?.dance_style) qs.set("dance_style", params.dance_style);

  const url =
    qs.toString().length > 0
      ? `/api/v1/studios/slots/?${qs.toString()}`
      : `/api/v1/studios/slots/`;

  const res = await apiFetch<Paginated<Slot>>(url);
  return res.results;
}
