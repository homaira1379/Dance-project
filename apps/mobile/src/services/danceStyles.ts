import { api } from "../lib/api";

export type DanceStyle = {
  uuid: string;
  name: string;
  description?: string;
};

export async function fetchDanceStyles() {
  const res = await api.get("/studios/dance-styles/");
  if (Array.isArray(res.data)) {
    return res.data as DanceStyle[];
  } else if (res.data && Array.isArray((res.data as any).results)) {
    return (res.data as any).results as DanceStyle[];
  }
  return [];
}
