"use client";

import { api } from "./api";

export type Studio = {
  uuid: string;
  name: string;
  city?: string;
  address?: string;

  // backend might return extra fields; keep flexible
  description?: string;
  phone_number?: string;
  email?: string;
  instagram?: string;
  website?: string;
};

export async function listStudios(params?: { search?: string; city?: string }) {
  const res = await api.get("/studios/studios/", { params });
  if (Array.isArray(res.data)) return res.data as Studio[];
  if (res.data && Array.isArray((res.data as any).results)) return (res.data as any).results as Studio[];
  return [];
}

export async function getStudio(uuid: string): Promise<Studio> {
  const res = await api.get(`/studios/studios/${uuid}/`);
  return res.data as Studio;
}
