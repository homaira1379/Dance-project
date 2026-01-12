"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  addTrainerToStudio,
  listOwnerStudios,
  listStudioTrainers,
  removeTrainerFromStudio,
  Studio,
  Trainer,
} from "../../../lib/owner";

type BusyKey = "add" | string | null;

function humanizeApiError(e: any) {
  const data = e?.response?.data;
  if (data && typeof data === "object") {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
      else if (typeof v === "string") parts.push(`${k}: ${v}`);
    }
    if (parts.length) return parts.join(" • ");
  }
  return e?.message || "Something went wrong.";
}

export default function OwnerTrainersTab() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyKey>(null);
  const [error, setError] = useState<string | null>(null);

  const [studios, setStudios] = useState<Studio[]>([]);
  const [studioUuid, setStudioUuid] = useState<string>("");

  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "password123",
  });

  const selectedStudio = useMemo(
    () => studios.find((s) => s.uuid === studioUuid) || null,
    [studios, studioUuid]
  );

  async function loadStudios() {
    const s = await listOwnerStudios();
    setStudios(s);
    if (!studioUuid && s.length > 0) setStudioUuid(s[0].uuid);
  }

  async function loadTrainers(forStudioUuid: string) {
    const t = await listStudioTrainers(forStudioUuid);
    setTrainers(t);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadStudios();
      } catch (e: any) {
        setError(humanizeApiError(e) || "Failed to load studios.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studioUuid) return;
    setLoading(true);
    setError(null);
    listStudioTrainers(studioUuid)
      .then((t) => setTrainers(t))
      .catch((e) => setError(humanizeApiError(e) || "Failed to load trainers."))
      .finally(() => setLoading(false));
  }, [studioUuid]);

  const onAdd = async () => {
    setError(null);

    if (!studioUuid) return setError("Please select a studio first.");
    if (!form.username.trim()) return setError("Username is required.");

    setBusy("add");
    try {
      await addTrainerToStudio(studioUuid, {
        username: form.username.trim(),
        email: form.email.trim() || undefined,
        first_name: form.first_name.trim() || undefined,
        last_name: form.last_name.trim() || undefined,
        password: form.password,
      });

      setForm({ username: "", email: "", first_name: "", last_name: "", password: "password123" });
      await loadTrainers(studioUuid);
    } catch (e: any) {
      setError(humanizeApiError(e) || "Failed to add trainer.");
    } finally {
      setBusy(null);
    }
  };

  const onRemove = async (trainerUuid: string) => {
    setError(null);

    if (!studioUuid) return setError("Please select a studio first.");

    setBusy(trainerUuid);
    try {
      await removeTrainerFromStudio(studioUuid, trainerUuid);
      await loadTrainers(studioUuid);
    } catch (e: any) {
      setError(humanizeApiError(e) || "Failed to remove trainer.");
    } finally {
      setBusy(null);
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
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Trainers</h3>
        <p className="text-gray-600 mt-2">Add trainers to your studio.</p>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Select Studio</label>
          <select
            value={studioUuid}
            onChange={(e) => setStudioUuid(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 bg-white"
          >
            {studios.length === 0 ? (
              <option value="">No studios found</option>
            ) : (
              studios.map((s) => (
                <option key={s.uuid} value={s.uuid}>
                  {s.name}
                </option>
              ))
            )}
          </select>

          {selectedStudio && (
            <div className="mt-2 text-xs text-gray-500">
              Studio UUID: <span className="font-mono">{selectedStudio.uuid}</span>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="username"
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email (optional)"
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
            />
            <input
              value={form.first_name}
              onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
              placeholder="first name"
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
            />
            <input
              value={form.last_name}
              onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
              placeholder="last name"
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
            />
            <button
              onClick={onAdd}
              disabled={busy === "add" || !form.username.trim() || !studioUuid}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              <Plus size={18} />
              {busy === "add" ? "Adding..." : "Add"}
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Default password used: <span className="font-mono">{form.password}</span>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 py-6">
              <Loader2 className="animate-spin" size={18} />
              Loading...
            </div>
          ) : trainers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
              No trainers yet.
            </div>
          ) : (
            <div className="space-y-3">
              {trainers.map((t) => (
                <div
                  key={t.uuid}
                  className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-extrabold text-gray-900">
                      {t.first_name || t.last_name
                        ? `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim()
                        : t.username}
                    </div>
                    <div className="text-sm text-gray-600">{t.email || t.username}</div>
                  </div>

                  <button
                    onClick={() => onRemove(t.uuid)}
                    disabled={busy === t.uuid}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:border-gray-300 disabled:opacity-60"
                  >
                    <Trash2 size={18} />
                    {busy === t.uuid ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
