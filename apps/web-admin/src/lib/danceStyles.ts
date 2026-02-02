"use client";

import { apiFetch } from "./apiFetch";

export type DanceStyle = {
  uuid: string;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active?: boolean;
};

export async function fetchDanceStyles(): Promise<DanceStyle[]> {
  const data = await apiFetch<any>(`/studios/dance-styles/`, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
