'use client';

import { api } from "./api";

export type Trainer = {
  uuid: string;
  first_name: string;
  last_name: string;
  bio?: string;
  photo?: string;
};

export async function fetchTrainers(studioId?: string) {
  const params: any = {};
  if (studioId) params.studio = studioId;

  const res = await api.get("/studios/trainers/", { params });
  
  if (Array.isArray(res.data)) {
    return res.data as Trainer[];
  } else if (res.data && Array.isArray((res.data as any).results)) {
    return (res.data as any).results as Trainer[];
  }
  return [];
}

export async function createTrainer(data: {
  first_name: string;
  last_name: string;
  bio?: string;
  photo?: any; // File or string depending on implementation
  studio: string;
}) {
  // If photo is a File/Blob, we need FormData. For now assume JSON or handled by component.
  // Actually, usually file uploads need FormData.
  // Let's assume JSON for text fields first.
  const res = await api.post("/studios/trainers/", data);
  return res.data;
}
