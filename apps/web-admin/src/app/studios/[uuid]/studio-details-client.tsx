"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, CalendarDays } from "lucide-react";

import { getStudio, Studio } from "@/lib/studios";
import { getStudioSlots, Slot } from "@/lib/slots";
import { BookingModal } from "@/components/booking/BookingModal";
import { createBooking } from "@/lib/bookings";

function getStartISO(s: Slot) {
  return s.starts_at || s.start_time || "";
}
function getEndISO(s: Slot) {
  return s.ends_at || s.end_time || "";
}

export default function StudioDetailsClient() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const uuid = params?.uuid;

  const [loading, setLoading] = useState(true);
  const [studio, setStudio] = useState<Studio | null>(null);

  const [sessions, setSessions] = useState<Slot[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // booking modal state
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Slot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadStudio() {
      if (!uuid) return;
      setLoading(true);
      setError(null);

      try {
        const s = await getStudio(uuid);
        if (!alive) return;
        setStudio(s);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load studio details.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadStudio();
    return () => {
      alive = false;
    };
  }, [uuid]);

  useEffect(() => {
    let alive = true;

    async function loadSessions() {
      if (!uuid) return;
      setSessionsLoading(true);
      setSessionsError(null);

      try {
        const list = await getStudioSlots(uuid);
        if (!alive) return;
        setSessions(list);
      } catch (e: any) {
        if (!alive) return;
        setSessions([]);
        setSessionsError(e?.message || "Failed to load sessions (slots).");
      } finally {
        if (!alive) return;
        setSessionsLoading(false);
      }
    }

    loadSessions();
    return () => {
      alive = false;
    };
  }, [uuid]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const ta = new Date(getStartISO(a)).getTime();
      const tb = new Date(getStartISO(b)).getTime();
      return ta - tb;
    });
  }, [sessions]);

  function handleBook(session: Slot) {
    if (!studio) return;
    setSelectedSession(session);
    setBookingError(null);
    setBookingSuccess(null);
    setOpenBooking(true);
  }

  async function confirmBooking() {
    if (!studio || !selectedSession) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      await createBooking({
        studio_uuid: (studio as any).uuid ?? uuid ?? "",
        studio_name: studio.name,
        slot_uuid: selectedSession.uuid,
        title: selectedSession.title || "Session",
        starts_at: getStartISO(selectedSession),
        ends_at: getEndISO(selectedSession) || null,
        price:
          typeof selectedSession.price === "number"
            ? selectedSession.price
            : typeof selectedSession.price === "string"
            ? Number(selectedSession.price)
            : null,
      });

      setBookingSuccess("✅ Booking saved locally (mock). Check Student → Main later.");
      setOpenBooking(false);
      setSelectedSession(null);
    } catch (e: any) {
      setBookingError(e?.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bookingError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingError}
        </div>
      )}

      {bookingSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {bookingSuccess}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : !studio ? (
          <div className="mt-6 text-gray-600">Studio not found.</div>
        ) : (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Studio details
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
              {studio.name}
            </h1>

            <div className="mt-3 inline-flex items-center gap-2 text-gray-600">
              <MapPin size={18} className="text-orange-500" />
              <span>
                {(studio.city ?? "—")}
                {studio.address ? ` • ${studio.address}` : ""}
              </span>
            </div>

            {studio.description && (
              <div className="mt-6">
                <div className="font-extrabold text-gray-900">Description</div>
                <p className="text-gray-700 mt-2 whitespace-pre-line">
                  {studio.description}
                </p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Phone" value={(studio as any).phone_number} />
              <InfoCard label="Email" value={(studio as any).email} />
              <InfoCard label="Instagram" value={(studio as any).instagram} />
              <InfoCard label="Website" value={(studio as any).website} />
            </div>

            {/* Sessions section */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-500">
                    Available sessions
                  </div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1">
                    Book a session
                  </div>
                </div>

                {sessionsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="animate-spin" size={16} />
                    Loading sessions...
                  </div>
                )}
              </div>

              {sessionsError && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {sessionsError}
                </div>
              )}

              <div className="mt-4 space-y-3">
                {!sessionsLoading && sortedSessions.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-gray-700">
                    No available sessions right now.
                  </div>
                ) : (
                  sortedSessions.map((s) => (
                    <SessionRow key={s.uuid} session={s} onBook={() => handleBook(s)} />
                  ))
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                * Booking is saved locally for now (mock).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking modal */}
      <BookingModal
        open={openBooking}
        onClose={() => {
          if (!bookingLoading) {
            setOpenBooking(false);
            setSelectedSession(null);
          }
        }}
        session={selectedSession}
        studio={studio}
        onConfirm={confirmBooking}
        loading={bookingLoading}
      />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className="mt-2 font-semibold text-gray-900">{value || "—"}</div>
    </div>
  );
}

function SessionRow({
  session,
  onBook,
}: {
  session: Slot;
  onBook: () => void;
}) {
  const startISO = session.starts_at || session.start_time || "";
  const endISO = session.ends_at || session.end_time || "";

  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  const dateLabel = start
    ? start.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  const timeLabel = start
    ? `${start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}${
        end
          ? ` – ${end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
          : ""
      }`
    : "—";

  const spots =
    typeof session.spots_left === "number"
      ? session.spots_left
      : typeof session.capacity === "number"
      ? session.capacity
      : null;

  const price =
    typeof session.price === "number"
      ? session.price
      : typeof session.price === "string"
      ? Number(session.price)
      : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-orange-500">
          <CalendarDays size={18} />
        </div>

        <div>
          <div className="font-extrabold text-gray-900">
            {session.title || "Session"}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {dateLabel} • {timeLabel}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {session.trainer || session.trainer_name
              ? `Trainer: ${session.trainer || session.trainer_name}`
              : "Trainer: —"}
            {spots !== null ? ` • Spots: ${spots}` : ""}
            {price !== null && !Number.isNaN(price) ? ` • Price: ${price}` : ""}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="rounded-xl px-4 py-2 font-semibold text-white bg-orange-500 hover:bg-orange-600"
      >
        Book
      </button>
    </div>
  );
}
