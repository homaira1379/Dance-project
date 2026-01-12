import { api } from "../lib/api";

export type Slot = {
  uuid: string;
  title: string;
  description?: string | null;
  studio?: string;
  studio_details?: { name?: string; city?: string; address?: string };
  trainer?: string | null;
  trainer_details?: { trainer_details?: { first_name?: string; last_name?: string } };
  dance_style_details?: { name?: string } | null;
  start_time: string;
  end_time: string;
  price: string;
  max_participants: number;
  current_bookings?: number;
  spots_remaining?: number;
  status?: string;
};

export async function listSlots(params?: {
  studio?: string;
  trainer?: string;
  dance_style?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  available_only?: boolean;
}) {
  const res = await api.get("/studios/slots/", {
    params: {
      available_only: true,
      ...params,
    },
  });
  
  if (Array.isArray(res.data)) {
    return res.data as Slot[];
  } else if (res.data && Array.isArray((res.data as any).results)) {
    return (res.data as any).results as Slot[];
  }
  return [];
}
