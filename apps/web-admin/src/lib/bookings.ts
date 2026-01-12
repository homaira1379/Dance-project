// apps/web-admin/src/lib/bookings.ts

export type Booking = {
  uuid: string;

  studio_uuid: string;
  studio_name: string;

  slot_uuid: string;
  title: string;

  starts_at: string; // ISO
  ends_at: string | null;

  price: number | null;

  status: "booked" | "cancelled";
  created_at: string; // ISO
};

export type CreateBookingInput = Omit<Booking, "uuid" | "status" | "created_at">;

const KEY = "dance_bookings_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function makeId(prefix = "b") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function readAll(): Booking[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(list: Booking[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** ✅ Used by your studio page */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const all = readAll();

  // avoid duplicates for same slot
  const existing = all.find(
    (b) => b.slot_uuid === input.slot_uuid && b.status !== "cancelled"
  );
  if (existing) return existing;

  const booking: Booking = {
    uuid: makeId("booking"),
    status: "booked",
    created_at: new Date().toISOString(),
    ...input,
  };

  writeAll([booking, ...all]);
  return booking;
}

/** ✅ Used by StudentMainTab (if you wired it) */
export async function getMyBookings(): Promise<Booking[]> {
  // If later you have auth, filter by user here.
  return readAll();
}

/** ✅ Used by StudentMainTab (if you wired it) */
export async function cancelBooking(bookingUuid: string): Promise<void> {
  const all = readAll();
  const next = all.map((b) =>
    b.uuid === bookingUuid ? { ...b, status: "cancelled" as const } : b
  );
  writeAll(next);
}

export async function clearBookings(): Promise<void> {
  writeAll([]);
}

/**
 * Optional helpers (so your other imports won’t fail)
 * You can expand later when backend booking endpoints exist.
 */
export type AppointmentSlot = {
  uuid: string;
  studio_uuid: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  price: number | null;
  capacity?: number;
  spots_left?: number;
};

export async function listAppointmentSlots(): Promise<AppointmentSlot[]> {
  // no-op mock
  return [];
}
