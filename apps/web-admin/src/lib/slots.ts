// apps/web-admin/src/lib/slots.ts
import { api } from "@/lib/api";

/**
 * Confirmed from DRF:
 * GET /api/v1/studios/studios/<uuid>/slots/
 */

export type Slot = {
  uuid: string;

  // backend may return either:
  start_time?: string;
  end_time?: string;

  starts_at?: string;
  ends_at?: string;

  title?: string;
  price?: number | string;
  capacity?: number;
  spots_left?: number;

  trainer?: string;
  trainer_name?: string;
};

export async function getStudioSlots(studioUuid: string): Promise<Slot[]> {
  const res = await api.get(`/studios/studios/${studioUuid}/slots/`);

  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.results)) return res.data.results;
  return [];
}
