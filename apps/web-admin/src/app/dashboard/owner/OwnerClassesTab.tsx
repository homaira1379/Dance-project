"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import {
  myStudios,
  listBookings,
  listSlots,
  createSlot,
  updateSlot,
  Booking,
  Slot,
  Studio,
  listTrainers,
  Trainer,
} from "../../../lib/owner";

import WeeklySchedule from "../../../components/dashboard/WeeklySchedule";

/* helpers */
function toISOFromDatetimeLocal(v: string) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDT(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function trainerDisplayName(t?: Partial<Trainer> | null) {
  if (!t) return "—";
  const full = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
  return full || (t as any).username || "—";
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

  const [view, setView] = useState<"list" | "schedule">("list");

  const [form, setForm] = useState({
    title: "Group Class",
    trainer: "",
    start_time: "",
    end_time: "",
    price: "10",
  });

  const selectedStudio = useMemo(
    () => studios.find((s) => s.uuid === studioId) || null,
    [studios, studioId],
  );

  const trainerById = useMemo(() => {
    const m: Record<string, Trainer> = {};
    trainers.forEach((t) => (m[t.uuid] = t));
    return m;
  }, [trainers]);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    title: "",
    trainer: "",
    start_time: "",
    end_time: "",
    price: "",
  });

  // slots -> ClassEvent[]
  const scheduleClasses = useMemo(() => {
    return (slots || []).map((s: any) => {
      const startAt = new Date(s.start_time).getTime();
      const endAt = new Date(s.end_time).getTime();

      const tr =
        s?.trainer_details && (s.trainer_details.first_name || s.trainer_details.last_name)
          ? s.trainer_details
          : s?.trainer
          ? trainerById[s.trainer]
          : null;

      return {
        id: s.uuid,
        studioId: selectedStudio?.uuid || "studio",
        title: s.title ?? "Slot",
        teacherId: s.trainer ?? "",
        teacherName: trainerDisplayName(tr),
        locationName:
          s?.studio_details?.address ||
          s?.studio_details?.city ||
          selectedStudio?.name ||
          "Studio",
        description: s.description,
        price: Number(s.price || 0),
        startAt,
        endAt,
      };
    });
  }, [slots, trainerById, selectedStudio]);

  async function loadStudioBase(sidToKeep?: string) {
    const s = await myStudios();
    setStudios(s);

    const first = s[0]?.uuid || "";
    const nextStudioId = sidToKeep || studioId || first;
    setStudioId(nextStudioId);

    const t = nextStudioId ? await listTrainers(nextStudioId) : [];
    setTrainers(t);

    return { studios: s, studioId: nextStudioId };
  }

  async function loadStudioData(sid: string) {
    const [sl, b] = await Promise.all([listSlots({ studio: sid }), listBookings({ studio: sid })]);
    setSlots(sl);
    setBookings(b);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const base = await loadStudioBase();
        if (base.studioId) await loadStudioData(base.studioId);
      } catch (e: any) {
        setError(e?.message || "Failed to load owner data.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studioId) return;
    setLoading(true);
    setError(null);

    Promise.all([loadStudioData(studioId), listTrainers(studioId)])
      .then(([, t]) => setTrainers(t))
      .catch((e: any) => setError(e?.message || "Failed to load studio data."))
      .finally(() => setLoading(false));
  }, [studioId]);

  const onCreateSlot = async () => {
    setError(null);
    if (!studioId) return setError("Select a studio first.");
    if (!form.start_time || !form.end_time) return setError("Start time and end time are required.");

    const startISO = toISOFromDatetimeLocal(form.start_time);
    const endISO = toISOFromDatetimeLocal(form.end_time);
    if (!startISO || !endISO) return setError("Invalid date/time format.");
    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) return setError("End time must be after start time.");

    setBusy(true);
    try {
      await createSlot({
        studio: studioId,
        trainer: form.trainer || undefined,
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

  // open edit modal
  const openEdit = (ev: any) => {
    setEditId(ev.id);
    setEditForm({
      title: ev.title ?? "",
      trainer: ev.teacherId ?? "",
      start_time: toDatetimeLocal(new Date(ev.startAt).toISOString()),
      end_time: toDatetimeLocal(new Date(ev.endAt).toISOString()),
      price: String(ev.price ?? ""),
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setError(null);
    if (!editId) return;

    const startISO = toISOFromDatetimeLocal(editForm.start_time);
    const endISO = toISOFromDatetimeLocal(editForm.end_time);
    if (!startISO || !endISO) return setError("Invalid date/time format.");
    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) return setError("End time must be after start time.");

    setBusy(true);
    try {
      await updateSlot(editId, {
        title: editForm.title,
        trainer: editForm.trainer ? editForm.trainer : null,
        start_time: startISO,
        end_time: endISO,
        price: Number(editForm.price || 0),
      });

      setEditOpen(false);
      await loadStudioData(studioId);
    } catch (e: any) {
      setError(e?.message || "Failed to update slot.");
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
        <div className="text-xs uppercase tracking-widest text-gray-500">Owner</div>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Classes & slots</h3>
        <p className="text-gray-600 mt-2">Create new class sessions (slots) and see bookings.</p>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : (
          <>
            {/* Create controls */}
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
                onChange={(e) => setForm((p) => ({ ...p, trainer: e.target.value }))}
                className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
              >
                <option value="">No trainer</option>
                {trainers.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {trainerDisplayName(t)}
                  </option>
                ))}
              </select>

              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Class title"
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />

              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />

              <div className="flex gap-2">
                <input
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
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
                Studio UUID: <span className="font-mono">{selectedStudio.uuid}</span>
              </div>
            )}

            {/* View toggle */}
            <div className="mt-8 flex items-center gap-2">
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                  view === "list"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("schedule")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                  view === "schedule"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Weekly Schedule
              </button>
            </div>

            {/* Slots */}
            <div className="mt-4">
              <div className="font-extrabold text-gray-900">Slots</div>

              {slots.length === 0 ? (
                <div className="text-sm text-gray-500 mt-3">No slots yet.</div>
              ) : view === "schedule" ? (
                <div className="mt-4">
                  {/* ✅ IMPORTANT: onEditClass */}
                  <WeeklySchedule classes={scheduleClasses as any} onEditClass={openEdit} />
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {slots.slice(0, 20).map((s: any) => (
                    <div key={s.uuid} className="rounded-xl border border-gray-200 p-4">
                      <div className="font-bold text-gray-900">{s.title ?? "Slot"}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDT(s.start_time)} → {formatDT(s.end_time)}
                        {s.price ? ` • $${s.price}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bookings */}
            <div className="mt-10">
              <div className="font-extrabold text-gray-900">Bookings</div>
              {bookings.length === 0 ? (
                <div className="text-sm text-gray-500 mt-3">No bookings yet.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {bookings.slice(0, 12).map((b) => (
                    <div key={b.uuid} className="rounded-xl border border-gray-200 p-4">
                      <div className="font-bold text-gray-900">Booking {b.uuid.slice(0, 8)}…</div>
                      <div className="text-sm text-gray-600 mt-1">Status: {b.status ?? "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit modal */}
            {editOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white border shadow-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-extrabold text-gray-900">Edit Class</div>
                    <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg p-2 hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Title</div>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Trainer</div>
                      <select
                        value={editForm.trainer}
                        onChange={(e) => setEditForm((p) => ({ ...p, trainer: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2 bg-white"
                      >
                        <option value="">No trainer</option>
                        {trainers.map((t) => (
                          <option key={t.uuid} value={t.uuid}>
                            {trainerDisplayName(t)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Start</div>
                        <input
                          type="datetime-local"
                          value={editForm.start_time}
                          onChange={(e) => setEditForm((p) => ({ ...p, start_time: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">End</div>
                        <input
                          type="datetime-local"
                          value={editForm.end_time}
                          onChange={(e) => setEditForm((p) => ({ ...p, end_time: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Price</div>
                      <input
                        value={editForm.price}
                        onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={busy}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
                    >
                      {busy ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
