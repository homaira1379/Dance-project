"use client";

import React from "react";
import { Loader2, X } from "lucide-react";
import type { Slot } from "@/lib/slots";
import type { Studio } from "@/lib/studios";

export function BookingModal({
  open,
  onClose,
  session,
  studio,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  session: Slot | null;
  studio: Studio | null;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  const starts = session?.starts_at || session?.start_time;
  const ends = session?.ends_at || session?.end_time;

  const startsLabel = starts ? new Date(starts).toLocaleString() : "—";
  const endsLabel = ends ? new Date(ends).toLocaleString() : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Booking
            </div>
            <div className="text-lg font-extrabold text-gray-900">
              Confirm booking
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="font-extrabold text-gray-900">
              {studio?.name || "Studio"}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {session?.title || "Session"}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {startsLabel} {endsLabel ? `→ ${endsLabel}` : ""}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            This booking is saved locally for now (mock). Later you can connect
            it to backend booking endpoint.
          </div>
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Booking...
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
