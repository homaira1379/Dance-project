import { api } from "../lib/api";

export type Booking = {
  uuid: string;
  appointment_slot: string;
  status: string;
  booking_date?: string;
  price?: string;
};

export async function createBooking(slotId: string, notes?: string) {
  const res = await api.post("/studios/bookings/", {
    appointment_slot: slotId,
    client_notes: notes ?? "",
  });
  return res.data as Booking;
}

export async function listBookings(params?: {
  status?: string;
  attended?: boolean;
  booking_date_from?: string;
  booking_date_to?: string;
}) {
  const res = await api.get("/studios/bookings/", { params });
  if (Array.isArray(res.data)) {
    return res.data as Booking[];
  } else if (res.data && Array.isArray((res.data as any).results)) {
    return (res.data as any).results as Booking[];
  }
  return [];
}

export async function markAttendance(bookingId: string, attended: boolean) {
  const res = await api.post(`/studios/bookings/${bookingId}/mark_attendance/`, {
    attended,
  });
  return res.data;
}

export async function cancelBooking(bookingId: string) {
  const res = await api.post(`/studios/bookings/${bookingId}/cancel/`);
  return res.data;
}
