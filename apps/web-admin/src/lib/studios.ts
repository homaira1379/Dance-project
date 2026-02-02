// apps/web-admin/src/lib/studios.ts
"use client";

import { apiFetch } from "./apiFetch";

export type Studio = {
  uuid: string;
  name: string;
  city: string;
  address: string;
  is_active?: boolean;
  cover_image?: string | null;
};

export async function fetchStudios(): Promise<Studio[]> {
  const data = await apiFetch<any>(`/api/v1/studios/studios/`, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
