"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { listOwnerStudios, Studio } from "../../../lib/owner";

export default function OwnerStudiosTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await listOwnerStudios();
        setStudios(s);
      } catch (e: any) {
        setError(e?.message || "Failed to load studios.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="text-xs uppercase tracking-widest text-gray-500">Owner</div>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Studios</h3>
        <p className="text-gray-600 mt-2">
          This tab lists studios returned by the backend. Editing can be added later.
        </p>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : studios.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No studios yet.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {studios.map((s) => (
              <div key={s.uuid} className="rounded-2xl border border-gray-200 p-4">
                <div className="font-extrabold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  UUID: <span className="font-mono">{s.uuid}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
