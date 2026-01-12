"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  myStudios,
  listBookings,
  listSlots,
  createSlot,
  Booking,
  Slot,
  Studio,
  listTrainers,
  Trainer,
} from "../../../lib/owner";

function toISOFromDatetimeLocal(v: string) {
  if (!v) return "";
  // "2026-01-11T18:30" -> Date -> ISO
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

function formatDT(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function OwnerClassesTab() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studios, setStudios] = useState<Studio[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [studioId, setStudioId] = useState<string>("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [form, setForm] = useState({
    title: "Group Class",
    trainer: "",
    start_time: "", // datetime-local
    end_time: "", // datetime-local
    price: "10",
  });

  const selectedStudio = useMemo(
    () => studios.find((s) => s.uuid === studioId) || null,
    [studios, studioId]
  );

  // Map trainers by id (so we can show trainer name inside slot list)
  const trainerById = useMemo(() => {
    const m: Record<string, Trainer> = {};
    trainers.forEach((t) => (m[t.uuid] = t));
    return m;
  }, [trainers]);

  const loadBase = async () => {
    const s = await myStudios();
    setStudios(s);

    const first = s[0]?.uuid || "";
    setStudioId((prev) => prev || first);

    // Load trainers for the initial studio (if exists)
    const initialStudio = studioId || first || "";
    const t = initialStudio ? await listTrainers(initialStudio) : [];
    setTrainers(t);

    return { s, t, first };
  };

  const loadStudioData = async (sid: string) => {
    const [sl, b] = await Promise.all([
      listSlots({ studio: sid }),
      listBookings({ studio: sid }),
    ]);
    setSlots(sl);
    setBookings(b);
  };

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { s, first } = await loadBase();
        const sid = studioId || first || s[0]?.uuid || "";
        if (sid) await loadStudioData(sid);
      } catch (e: any) {
        setError(e?.message || "Failed to load owner data.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When studio changes, reload slots/bookings AND trainers for that studio ✅
  useEffect(() => {
    if (!studioId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      loadStudioData(studioId),
      listTrainers(studioId),
    ])
      .then(([, t]) => setTrainers(t))
      .catch((e: any) => setError(e?.message || "Failed to load studio data."))
      .finally(() => setLoading(false));
  }, [studioId]);

  const onCreateSlot = async () => {
    setError(null);

    if (!studioId) return setError("Select a studio first.");
    if (!form.start_time || !form.end_time)
      return setError("Start time and end time are required.");

    const startISO = toISOFromDatetimeLocal(form.start_time);
    const endISO = toISOFromDatetimeLocal(form.end_time);

    if (!startISO || !endISO) return setError("Invalid date/time format.");

    setBusy(true);
    try {
      await createSlot({
        studio: studioId,
        trainer: form.trainer, // optional string uuid
        title: form.title,
        start_time: startISO,
        end_time: endISO,
        price: Number(form.price || 0) || undefined,
      });

      await loadStudioData(studioId);
      setForm((p) => ({ ...p, start_time: "", end_time: "" }));
    } catch (e: any) {
      setError(e?.message || "Failed to create slot.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="text-xs uppercase tracking-widest text-gray-500">
          Owner
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
          Classes & slots
        </h3>
        <p className="text-gray-600 mt-2">
          Create new class sessions (slots) and see bookings.
        </p>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={studioId}
                onChange={(e) => setStudioId(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
              >
                {studios.map((s) => (
                  <option key={s.uuid} value={s.uuid}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={form.trainer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, trainer: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
              >
                <option value="">No trainer</option>
                {trainers.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {t.first_name || t.last_name
                      ? `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim()
                      : t.username}
                  </option>
                ))}
              </select>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Class title"
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, start_time: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, end_time: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
              <div className="flex gap-2">
                <input
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="Price"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3"
                />
                <button
                  onClick={onCreateSlot}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:bg-orange-600 disabled:opacity-60"
                >
                  <Plus size={18} />
                  {busy ? "Creating..." : "Create"}
                </button>
              </div>
            </div>

            {selectedStudio && (
              <div className="mt-2 text-xs text-gray-500">
                Studio UUID:{" "}
                <span className="font-mono">{selectedStudio.uuid}</span>
              </div>
            )}

            <div className="mt-8">
              <div className="font-extrabold text-gray-900">Slots</div>
              {slots.length === 0 ? (
                <div className="text-sm text-gray-500 mt-3">No slots yet.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {slots.slice(0, 12).map((s: any) => {
                    const tr =
                      (s.trainer_details &&
                        (s.trainer_details.first_name ||
                          s.trainer_details.last_name ||
                          s.trainer_details.username))
                        ? s.trainer_details
                        : s.trainer
                        ? trainerById[s.trainer]
                        : null;

                    const trName = tr
                      ? `${tr.first_name ?? ""} ${tr.last_name ?? ""}`.trim() ||
                        tr.username ||
                        "—"
                      : "—";

                    return (
                      <div
                        key={s.uuid}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="font-bold text-gray-900">
                          {s.title ?? "Slot"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatDT(s.start_time)} → {formatDT(s.end_time)}
                          {s.price ? ` • $${s.price}` : ""}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Trainer:</span>{" "}
                          {trName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-10">
              <div className="font-extrabold text-gray-900">Bookings</div>
              {bookings.length === 0 ? (
                <div className="text-sm text-gray-500 mt-3">
                  No bookings yet.
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {bookings.slice(0, 12).map((b) => (
                    <div
                      key={b.uuid}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="font-bold text-gray-900">
                        Booking {b.uuid.slice(0, 8)}…
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Status: {b.status ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
