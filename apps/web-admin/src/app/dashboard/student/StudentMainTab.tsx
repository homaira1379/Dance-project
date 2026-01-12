"use client";

import React, { useMemo, useState } from "react";
import { Search, CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";

type SlotCard = {
  uuid: string;
  title: string;
  studioName: string;
  city: string;
  start: string;
  end: string;
  level: "Beginner" | "Intermediate" | "All Levels";
  style: "Hip-Hop" | "Ballet" | "Contemporary" | "Jazz";
  price: number;
};

const DEMO_SLOTS: SlotCard[] = [
  {
    uuid: "slot-1",
    title: "Ballet Basics",
    studioName: "Dance Masters Studio",
    city: "Almaty",
    start: "2026-02-04T09:00:00",
    end: "2026-02-04T10:00:00",
    level: "Beginner",
    style: "Ballet",
    price: 10,
  },
  {
    uuid: "slot-2",
    title: "Hip-Hop Energy",
    studioName: "Dance Masters Studio",
    city: "Almaty",
    start: "2026-02-04T18:00:00",
    end: "2026-02-04T19:15:00",
    level: "All Levels",
    style: "Hip-Hop",
    price: 12,
  },
  {
    uuid: "slot-3",
    title: "Contemporary Flow",
    studioName: "Elevate Dance Studio",
    city: "Almaty",
    start: "2026-02-05T11:00:00",
    end: "2026-02-05T12:00:00",
    level: "Intermediate",
    style: "Contemporary",
    price: 11,
  },
];

function formatDT(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function StudentMainTab() {
  const [q, setQ] = useState("");
  const [style, setStyle] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");

  const slots = useMemo(() => {
    return DEMO_SLOTS.filter((s) => {
      const matchQ =
        !q.trim() ||
        s.title.toLowerCase().includes(q.toLowerCase()) ||
        s.studioName.toLowerCase().includes(q.toLowerCase());

      const matchStyle = style === "all" || s.style === style;
      const matchLevel = level === "all" || s.level === level;

      return matchQ && matchStyle && matchLevel;
    });
  }, [q, style, level]);

  const onBook = (slot: SlotCard) => {
    // Until backend booking works
    alert(`Booking UI ready ✅\nSlot: ${slot.title}\n(Backend will confirm later)`);
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="text-xs uppercase tracking-widest text-gray-500">Student</div>
      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Find classes</h3>
      <p className="text-gray-600 mt-2">Browse upcoming class slots and book your spot.</p>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by class or studio..."
            className="w-full outline-none"
          />
        </div>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
        >
          <option value="all">All styles</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="Ballet">Ballet</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Jazz">Jazz</option>
        </select>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 bg-white"
        >
          <option value="all">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="All Levels">All Levels</option>
        </select>
      </div>

      {/* Slots list */}
      <div className="mt-8">
        <div className="flex items-center gap-2 font-extrabold text-gray-900">
          <Sparkles size={18} className="text-orange-500" />
          Available slots
        </div>

        {slots.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No slots match your filters.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.map((s) => (
              <div key={s.uuid} className="rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {s.studioName} • {s.city}
                    </div>
                  </div>
                  <div className="text-xs font-semibold rounded-full px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100">
                    {s.style} • {s.level}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-gray-400" />
                    {formatDT(s.start)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    {formatDT(s.end)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="font-extrabold text-gray-900">${s.price}</div>
                  <button
                    onClick={() => onBook(s)}
                    className="rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:bg-orange-600"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
