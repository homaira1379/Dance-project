"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Slot, createSlot, deleteSlot, getStudioSlots } from "@/lib/slots";

function toLocalInputValue(d: Date) {
  // yyyy-MM-ddTHH:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toISOFromLocalInput(v: string) {
  // v = "2026-01-09T10:00"
  // interpret as local time and convert to ISO
  const dt = new Date(v);
  return dt.toISOString();
}

export function SlotsManager({ studioUuid }: { studioUuid: string }) {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState("Beginner class");
  const [capacity, setCapacity] = useState<number>(10);
  const [price, setPrice] = useState<number>(3000);

  const now = useMemo(() => new Date(), []);
  const [startLocal, setStartLocal] = useState(toLocalInputValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)));
  const [endLocal, setEndLocal] = useState(toLocalInputValue(new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000)));

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await getStudioSlots(studioUuid);
      setSlots(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load slots.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioUuid]);

  const sorted = useMemo(() => {
    const getStart = (s: Slot) => s.start_time || s.starts_at || "";
    return [...slots].sort((a, b) => {
      const ta = new Date(getStart(a)).getTime();
      const tb = new Date(getStart(b)).getTime();
      return ta - tb;
    });
  }, [slots]);

  async function onCreate() {
    setCreating(true);
    setError(null);
    try {
      await createSlot({
        studioUuid,
        startISO: toISOFromLocalInput(startLocal),
        endISO: toISOFromLocalInput(endLocal),
        title,
        capacity,
        price,
      });
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create slot.");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(slotUuid: string) {
    if (!confirm("Delete this slot?")) return;
    try {
      await deleteSlot(slotUuid);
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Delete failed (endpoint may not exist).");
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Owner tools
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mt-1">
            Manage slots
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create future slots so students can book.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">
            Title
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-500">
            Capacity
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            min={1}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-500">
            Price
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="w-full rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Create
            </span>
          </button>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">
            Start (local)
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">
            End (local)
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={endLocal}
            onChange={(e) => setEndLocal(e.target.value)}
          />
        </div>
      </div>

      {/* Slots list */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">Existing slots</h3>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="animate-spin" size={16} />
              Loading...
            </div>
          )}
        </div>

        {!loading && sorted.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700">
            No slots yet. Create one above.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {sorted.map((s) => {
              const start = s.start_time || s.starts_at;
              const end = s.end_time || s.ends_at;
              return (
                <div
                  key={s.uuid}
                  className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="font-extrabold text-gray-900">
                      {s.title || "Slot"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {start ? new Date(start).toLocaleString() : "—"}{" "}
                      {end ? `→ ${new Date(end).toLocaleString()}` : ""}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Capacity: {s.capacity ?? "—"}{" "}
                      {typeof s.price !== "undefined" ? `• Price: ${s.price}` : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(s.uuid)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        If delete fails, backend probably doesn’t support DELETE for slots yet.
      </div>
    </div>
  );
}
