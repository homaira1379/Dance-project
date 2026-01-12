import { api } from "../lib/api";

export type Studio = {
  uuid: string;
  name: string;
  address?: string;
  city?: string;
};

export async function listStudios() {
  const res = await api.get("/studios/studios/");
  if (Array.isArray(res.data)) {
    return res.data as Studio[];
  } else if (res.data && Array.isArray((res.data as any).results)) {
    return (res.data as any).results as Studio[];
  }
  return [];
}
