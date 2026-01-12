"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Loader2,
  Clock3,
} from "lucide-react";
import { fetchClasses, type ClassEvent } from "../../lib/classes";
import { useAuthUser } from "../../lib/useAuthUser";
import {
  cancelBooking,
  createBooking,
  fetchUserBookings,
  type Booking,
} from "../../lib/bookings";
import Link from "next/link";

type ActionState = {
  [classId: string]: boolean;
};

export function StudentClassList() {
  const { user, loading: authLoading } = useAuthUser();
  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const data = await fetchClasses();
        const now = Date.now();
        const upcoming = data.filter((c) => c.startAt > now);
        setClasses(upcoming);
      } catch (err) {
        console.error(err);
        setError("Unable to load classes right now.");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setBookings([]);
        return;
      }
      try {
        const data = await fetchUserBookings();
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadBookings();
  }, [user]);

  const bookingMap = useMemo(() => {
    const map: Record<string, Booking> = {};
    bookings.forEach((b) => {
      map[b.appointment_slot] = b;
    });
    return map;
  }, [bookings]);

  const setBusy = (classId: string, value: boolean) =>
    setActionState((prev) => ({ ...prev, [classId]: value }));

  const updateClassCounts = (
    classId: string,
    delta: { reserved?: number; waitlist?: number }
  ) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? {
              ...c,
              reservedCount: (c.reservedCount ?? 0) + (delta.reserved ?? 0),
              waitlistCount: (c.waitlistCount ?? 0) + (delta.waitlist ?? 0),
            }
          : c
      )
    );
  };

  const handleBook = async (classId: string) => {
    setError(null);
    setBusy(classId, true);
    try {
      const result = await createBooking(classId);

      setBookings((prev) => [
        ...prev.filter((b) => b.appointment_slot !== classId),
        { ...result },
      ]);

      const status = result.status?.toLowerCase();
      if (status === "confirmed") updateClassCounts(classId, { reserved: 1 });
      if (status === "waitlisted") updateClassCounts(classId, { waitlist: 1 });
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to book this class right now."
      );
    } finally {
      setBusy(classId, false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    const classId = booking.appointment_slot;
    setError(null);
    setBusy(classId, true);
    try {
      await cancelBooking(booking.uuid);
      setBookings((prev) => prev.filter((b) => b.uuid !== booking.uuid));

      const status = booking.status?.toLowerCase();
      if (status === "confirmed") updateClassCounts(classId, { reserved: -1 });
      if (status === "waitlisted") updateClassCounts(classId, { waitlist: -1 });
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel this booking right now."
      );
    } finally {
      setBusy(classId, false);
    }
  };

  const renderCTA = (c: ClassEvent) => {
    const booking = bookingMap[c.id];
    const busy = actionState[c.id];
    const seatsTaken = c.reservedCount ?? 0;
    const capacity = c.capacity || 1;
    const seatsLeft = Math.max(capacity - seatsTaken, 0);

    if (!user && !authLoading) {
      return (
        <Link
          href="/login"
          className="text-orange-700 font-semibold text-sm hover:text-orange-800 flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors"
        >
          Login to book <ArrowRight size={16} />
        </Link>
      );
    }

    if (booking) {
      const isWaitlisted = booking.status?.toLowerCase() === "waitlisted";
      return (
        <button
          onClick={() => handleCancel(booking)}
          disabled={busy}
          className="text-red-600 font-semibold text-sm hover:text-red-700 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Clock3 size={16} />
          )}
          {isWaitlisted ? "Leave waitlist" : "Cancel booking"}
        </button>
      );
    }

    const joiningWaitlist = seatsLeft <= 0;

    return (
      <button
        onClick={() => handleBook(c.id)}
        disabled={busy || authLoading}
        className="text-white font-semibold text-sm flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-70"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        {joiningWaitlist ? "Join waitlist" : "Book seat"}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading available classes...
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No upcoming classes scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => {
          const booking = bookingMap[c.id];
          const seatsTaken = c.reservedCount ?? 0;
          const waitlist = c.waitlistCount ?? 0;
          const capacity = c.capacity || 1;

          const percentFilled = Math.min(
            100,
            Math.round((seatsTaken / capacity) * 100)
          );

          const statusColor =
            booking?.status?.toLowerCase() === "waitlisted"
              ? "bg-amber-100 text-amber-700"
              : booking?.status?.toLowerCase() === "confirmed"
              ? "bg-emerald-100 text-emerald-700"
              : "";

          const levelColor =
            c.level === "beginner"
              ? "bg-green-100 text-green-700"
              : c.level === "intermediate"
              ? "bg-amber-100 text-amber-700"
              : c.level === "advanced"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700";

          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-2 ${levelColor}`}
                  >
                    {c.level}
                  </span>

                  <h4 className="text-lg font-bold text-gray-900 leading-tight">
                    {c.title}
                  </h4>

                  {c.teacherName && (
                    <p className="text-xs text-gray-500 mt-1">
                      With {c.teacherName}
                    </p>
                  )}
                </div>

                {booking && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}
                  >
                    {booking.status?.toLowerCase() === "waitlisted"
                      ? "Waitlisted"
                      : "Booked"}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{format(new Date(c.startAt), "EEE, MMM d")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    {format(new Date(c.startAt), "h:mm a")} -{" "}
                    {format(new Date(c.endAt), "h:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{c.locationName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span>
                    {seatsTaken}/{capacity} filled
                    {waitlist > 0 ? ` • ${waitlist} waitlisted` : ""}
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      percentFilled > 90
                        ? "bg-red-400"
                        : percentFilled > 70
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-auto">
                <span className="font-bold text-gray-900 text-lg">
                  ${c.price}
                </span>
                {renderCTA(c)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
