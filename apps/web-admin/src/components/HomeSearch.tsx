"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Search, User } from "lucide-react";

import { fetchClasses, type ClassEvent } from "../lib/classes";
import { fetchDanceStyles, type DanceStyle } from "../lib/danceStyles";

type Option = { value: string; label: string };

function toYmd(d: string) {
  return d || "";
}

function addDaysYmd(ymd: string, days: number) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatPrice(p: number) {
  const n = Number.isFinite(p) ? p : 0;
  return `$${n}`;
}

function formatDateTime(startAt: number, endAt: number) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const date = start.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const startTime = start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} · ${startTime} – ${endTime}`;
}

/**
 * Your real folder: /public/images/classes/
 * These must exist:
 *  - ballet.jpg
 *  - contemporary.jpg
 *  - default.jpg
 *  - hip-hop.jpg
 *  - jazz.jpg
 *  - salsa.jpg
 */
const IMAGE_POOL = [
  "/images/classes/ballet.jpg",
  "/images/classes/hip-hop.jpg",
  "/images/classes/contemporary.jpg",
  "/images/classes/jazz.jpg",
  "/images/classes/salsa.jpg",
  "/images/classes/default.jpg",
];

function normalizeStyleKey(styleName?: string) {
  const s = (styleName || "").trim().toLowerCase();
  if (!s || s === "—") return "";

  if (s.includes("ballet")) return "ballet";
  if (s.includes("hip")) return "hip-hop";
  if (s.includes("contemporary")) return "contemporary";
  if (s.includes("jazz")) return "jazz";
  if (s.includes("salsa")) return "salsa";
  return "";
}

function stableHash(input: string) {
  // simple stable hash (no crypto) -> 0..2^32
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFallbackImage(seed: string) {
  const idx = stableHash(seed) % IMAGE_POOL.length;
  return IMAGE_POOL[idx];
}

function imageForClass(c: any) {
  // 1) Try style-based image first
  const key = normalizeStyleKey(c.styleName);
  if (key) return `/images/classes/${key}.jpg`;

  // 2) If style missing, pick a "random but stable" image per card
  const seed = String(c.id || c.uuid || c.title || "") + "|" + String(c.studioName || c.studioId || "");
  return pickFallbackImage(seed);
}

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const [level, setLevel] = useState<"" | "beginner" | "intermediate" | "advanced">("");

  const [city, setCity] = useState("");
  const [studioId, setStudioId] = useState("");
  const [danceStyleId, setDanceStyleId] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [styles, setStyles] = useState<DanceStyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ClassEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runSearch() {
    setLoading(true);
    setError(null);

    try {
      const startDate = toYmd(date);
      const endDate = startDate ? addDaysYmd(startDate, 1) : "";

      const min = minPrice !== "" ? Number(minPrice) : undefined;
      const max = maxPrice !== "" ? Number(maxPrice) : undefined;

      const data = await fetchClasses({
        studio: studioId || undefined,
        dance_style: danceStyleId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        available_only: availableOnly,
        min_price: Number.isFinite(min as any) ? min : undefined,
        max_price: Number.isFinite(max as any) ? max : undefined,
      });

      setResults(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load classes");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    fetchDanceStyles()
      .then((s) => setStyles(s || []))
      .catch(() => setStyles([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cityOptions: Option[] = useMemo(() => {
    const set = new Set<string>();

    results.forEach((c: any) => {
      const rawCity = (c as any).city;
      if (typeof rawCity === "string" && rawCity.trim()) set.add(rawCity.trim());
    });

    results.forEach((c: any) => {
      const m = String((c as any).studioName || "").match(/\(([^)]+)\)\s*$/);
      if (m?.[1]) set.add(m[1].trim());
    });

    return [{ value: "", label: "All cities" }, ...Array.from(set).sort().map((x) => ({ value: x, label: x }))];
  }, [results]);

  const studioOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    results.forEach((c: any) => {
      const id = String(c.studioId || "");
      const name = String((c as any).studioName || c.studioId || "");
      if (id && name) map.set(id, name);
    });

    const list = Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: "", label: "All studios" }, ...list];
  }, [results]);

  const styleOptions: Option[] = useMemo(() => {
    return [
      { value: "", label: "All styles" },
      ...styles
        .filter((s) => s.is_active !== false)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .map((s) => ({ value: s.uuid, label: s.name })),
    ];
  }, [styles]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const lvl = level.trim().toLowerCase();
    const chosenCity = city.trim().toLowerCase();

    return results.filter((c: any) => {
      if (q) {
        const hay = [c.title, c.teacherName, (c as any).studioName, (c as any).city, (c as any).styleName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (lvl) {
        const t = String(c.title || "").toLowerCase();
        const d = String(c.description || "").toLowerCase();
        if (!t.includes(lvl) && !d.includes(lvl)) return false;
      }

      if (chosenCity) {
        const cityField = String((c as any).city || "").toLowerCase();
        if (!cityField || cityField !== chosenCity) return false;
      }

      return true;
    });
  }, [results, query, level, city]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#6a63c7] via-[#6a63c7] to-[#5b56b7] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* HERO */}
        <div className="text-center text-white mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Find Your Class</h1>
          <p className="mt-4 text-white/90 text-lg md:text-xl">Search real dance classes available right now</p>
        </div>

        {/* FILTER PANEL */}
        <div className="bg-white/95 backdrop-blur rounded-[2rem] shadow-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Search by class title, studio, trainer...
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Ballet, Hip Hop, Contemporary..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {cityOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Studio</label>
              <select
                value={studioId}
                onChange={(e) => setStudioId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {studioOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Style</label>
              <select
                value={danceStyleId}
                onChange={(e) => setDanceStyleId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {styleOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold text-slate-800">Available only</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Min price</label>
              <input
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Max price</label>
              <input
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$1000"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={runSearch}
                className="w-full rounded-2xl bg-orange-500 text-white font-extrabold text-lg py-3 hover:bg-orange-600 transition"
              >
                Search Classes
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-10">
          {loading && <div className="text-center text-white/90">Loading classes…</div>}
          {error && <div className="text-center text-red-200 font-semibold">{error}</div>}
          {!loading && !error && filteredResults.length === 0 && (
            <div className="text-center text-white/80">No classes found</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredResults.map((c: any) => {
              const studioName = c.studioName || c.studioId || "—";
              const cityName = c.city || "";
              const styleName = c.styleName || "—";

              const imgSrc = imageForClass(c);

              return (
                <div
                  key={c.id}
                  className="rounded-[2rem] overflow-hidden bg-white shadow-xl border border-white/30 hover:shadow-2xl transition"
                >
                  <div className="relative h-40">
                    <Image
                      src={imgSrc}
                      alt="Dance class"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                    <div className="absolute top-4 right-4">
                      <div className="bg-orange-500 text-white font-extrabold px-4 py-2 rounded-2xl shadow">
                        {formatPrice(c.price ?? 0)}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-extrabold text-slate-900">{c.title}</h3>

                    <div className="mt-3 flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm">{formatDateTime(c.startAt, c.endAt)}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} />
                          <span>Studio</span>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-900">{studioName}</div>
                          {cityName ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mt-2">
                              {cityName}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <User size={16} />
                          <span>Trainer</span>
                        </div>
                        <div className="font-bold text-slate-900">{c.teacherName || "—"}</div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-slate-500">Style</div>
                        <div className="font-bold text-slate-900">{styleName}</div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-slate-500">Level</div>
                        <div className="font-bold text-slate-900">{c.level || "all"}</div>
                      </div>
                    </div>

                    <div className="mt-5 text-xs text-slate-400">
                      * Images are local placeholders until backend adds media.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
