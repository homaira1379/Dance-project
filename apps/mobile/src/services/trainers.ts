import { api } from "../lib/api";

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
