"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { myStudios, Studio } from "../../../lib/owner";

export default function OwnerStudiosTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await myStudios();
        setStudios(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load studios.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={18} />
        Loading studios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (studios.length === 0) {
    return <div className="text-gray-500">No studios found.</div>;
  }

  return (
    <div className="space-y-4">
      {studios.map((s: any) => {
        const city = s.city as string | undefined;
        const address = s.address as string | undefined;
        const twoGis = s.two_gis_url as string | undefined;
        const igUser = s.instagram_username as string | undefined;
        const igUrl = s.instagram_url as string | undefined;

        const addressText =
          city && address ? `${city}, ${address}` : city || address || "";

        return (
          <div
            key={s.uuid}
            className="rounded-xl border border-gray-200 p-4 bg-white"
          >
            <div className="font-bold text-gray-900 text-lg">{s.name}</div>

            {addressText && (
              <div className="text-sm text-gray-600 mt-1">{addressText}</div>
            )}

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-semibold">2GIS:</span>{" "}
                {twoGis ? (
                  <a
                    className="text-orange-600 underline"
                    href={twoGis}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open link
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>

              <div>
                <span className="font-semibold">Instagram:</span>{" "}
                {igUser ? (
                  <a
                    className="text-orange-600 underline"
                    href={`https://instagram.com/${igUser.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{igUser.replace("@", "")}
                  </a>
                ) : igUrl ? (
                  <a
                    className="text-orange-600 underline"
                    href={igUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              UUID: <span className="font-mono">{s.uuid}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
