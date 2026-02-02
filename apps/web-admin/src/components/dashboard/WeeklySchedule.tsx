"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ClassEvent } from "../../lib/classes";

type Props = {
  classes: ClassEvent[];
  weekStart?: Date;
  onEditClass?: (ev: ClassEvent) => void; // ✅ click-to-edit hook
};

const DAYS = [
  { key: 0, label: "Monday" },
  { key: 1, label: "Tuesday" },
  { key: 2, label: "Wednesday" },
  { key: 3, label: "Thursday" },
  { key: 4, label: "Friday" },
  { key: 5, label: "Saturday" },
  { key: 6, label: "Sunday" },
] as const;

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // Sun=0
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* academic UI */
function getTermRange(year: number, term: 1 | 2) {
  if (term === 1) {
    const start = new Date(year, 8, 1);
    const end = new Date(year + 1, 0, 31);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = new Date(year, 1, 1);
  const end = new Date(year, 5, 30);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
function weeksBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return Math.ceil(days / 7);
}
function weekIndexInTerm(termStart: Date, weekMonday: Date) {
  const diffDays = Math.floor((weekMonday.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}
function inferAcademic(date: Date): { year: number; term: 1 | 2 } {
  const m = date.getMonth();
  if (m >= 8 || m === 0) {
    const y = m === 0 ? date.getFullYear() - 1 : date.getFullYear();
    return { year: y, term: 1 };
  }
  return { year: date.getFullYear(), term: 2 };
}

/* time rows like teacher screenshot (08:00–21:50) */
type TimeRow = { start: string; end: string };
function buildTimeRows(): TimeRow[] {
  const rows: TimeRow[] = [];
  for (let h = 8; h <= 21; h++) {
    rows.push({ start: `${String(h).padStart(2, "0")}:00`, end: `${String(h).padStart(2, "0")}:50` });
  }
  return rows;
}
function minutesFromHHMM(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map((x) => Number(x));
  return hh * 60 + mm;
}
function eventMatchesRow(ev: ClassEvent, row: TimeRow) {
  const s = new Date(ev.startAt);
  const e = new Date(ev.endAt);

  const rowStartMin = minutesFromHHMM(row.start);
  const rowEndMin = minutesFromHHMM(row.end);

  const evStartMin = s.getHours() * 60 + s.getMinutes();
  const evEndMin = e.getHours() * 60 + e.getMinutes();

  return evStartMin < rowEndMin && evEndMin > rowStartMin;
}

/* ✅ Color per trainer (stable) */
function colorFromKey(key: string) {
  // soft pastel-ish HSL, stable per key
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return {
    bg: `hsl(${hue} 85% 96%)`,
    border: `hsl(${hue} 70% 70%)`,
    text: `hsl(${hue} 55% 28%)`,
  };
}

export default function WeeklySchedule({ classes, weekStart, onEditClass }: Props) {
  const [base, setBase] = useState<Date>(startOfWeekMonday(weekStart ?? new Date()));

  const initAcad = useMemo(() => inferAcademic(weekStart ?? new Date()), [weekStart ? weekStart.getTime() : 0]);
  const [year, setYear] = useState<number>(initAcad.year);
  const [term, setTerm] = useState<1 | 2>(initAcad.term);

  const termRange = useMemo(() => getTermRange(year, term), [year, term]);
  const totalTermWeeks = useMemo(() => weeksBetween(termRange.start, termRange.end), [termRange]);
  const [weekNumber, setWeekNumber] = useState<number>(1);

  // sync when parent changes weekStart
  useEffect(() => {
    if (!weekStart) return;
    const monday = startOfWeekMonday(weekStart);
    setBase(monday);
    const acad = inferAcademic(weekStart);
    setYear(acad.year);
    setTerm(acad.term);
  }, [weekStart ? weekStart.getTime() : 0]);

  // sync dropdown week when base changes
  useEffect(() => {
    const w = weekIndexInTerm(termRange.start, base);
    setWeekNumber(clamp(w, 1, totalTermWeeks));
  }, [base, termRange.start, totalTermWeeks]);

  const days = useMemo(() => DAYS.map((_, i) => addDays(base, i)), [base]);

  const weekClasses = useMemo(() => {
    const weekEnd = addDays(base, 7).getTime();
    const weekStartMs = base.getTime();
    return classes.filter((c) => c.startAt < weekEnd && c.endAt > weekStartMs);
  }, [classes, base]);

  const byDay = useMemo(() => {
    const m: Record<number, ClassEvent[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const c of weekClasses) {
      const start = new Date(c.startAt);
      const idx = days.findIndex((d) => sameDay(d, start));
      if (idx >= 0) m[idx].push(c);
    }
    for (const k of Object.keys(m)) m[Number(k)].sort((a, b) => a.startAt - b.startAt);
    return m;
  }, [weekClasses, days]);

  const timeRows = useMemo(() => buildTimeRows(), []);

  const goPrevWeek = () => setBase((p) => addDays(p, -7));
  const goNextWeek = () => setBase((p) => addDays(p, 7));
  const goToday = () => setBase(startOfWeekMonday(new Date()));

  const jumpToTermWeek = (w: number) => setBase(startOfWeekMonday(addDays(termRange.start, (w - 1) * 7)));

  const onChangeTerm = (t: 1 | 2) => {
    setTerm(t);
    const tr = getTermRange(year, t);
    setBase(startOfWeekMonday(tr.start));
    setWeekNumber(1);
  };

  const onChangeYear = (y: number) => {
    setYear(y);
    const tr = getTermRange(y, term);
    setBase(startOfWeekMonday(tr.start));
    setWeekNumber(1);
  };

  return (
    <div className="w-full">
      {/* controls */}
      <div className="rounded-2xl border bg-white p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold text-gray-900">Schedule</div>

          <button onClick={goPrevWeek} className="px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50" type="button">
            ←
          </button>
          <button onClick={goToday} className="px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50" type="button">
            Today
          </button>
          <button onClick={goNextWeek} className="px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50" type="button">
            →
          </button>

          <div className="ml-auto flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-gray-500">YEAR</div>
              <select value={year} onChange={(e) => onChangeYear(Number(e.target.value))} className="rounded-xl border px-3 py-2 text-sm bg-white">
                {Array.from({ length: 6 }).map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={y} value={y}>
                      {y}-{y + 1}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-gray-500">TERM</div>
              <select value={term} onChange={(e) => onChangeTerm(Number(e.target.value) as 1 | 2)} className="rounded-xl border px-3 py-2 text-sm bg-white">
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-gray-500">WEEKS</div>
              <select
                value={weekNumber}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setWeekNumber(w);
                  jumpToTermWeek(w);
                }}
                className="rounded-xl border px-3 py-2 text-sm bg-white"
              >
                {Array.from({ length: totalTermWeeks }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-500">BEGINNING OF A TERM</div>
            <div className="rounded-xl border px-3 py-2 bg-gray-50">{fmtISODate(termRange.start)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">END OF A TERM</div>
            <div className="rounded-xl border px-3 py-2 bg-gray-50">{fmtISODate(termRange.end)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">CURRENT WEEK</div>
            <div className="rounded-xl border px-3 py-2 bg-gray-50">
              {fmtISODate(base)} – {fmtISODate(addDays(base, 6))}
            </div>
          </div>
        </div>
      </div>

      {/* teacher-style day cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map((day, idx) => {
          const dayDate = days[idx];
          const events = byDay[idx] || [];

          return (
            <div key={day.key} className="rounded-2xl border bg-white overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {day.label}
                  <span className="text-gray-500 font-normal"> • {fmtDayHeader(dayDate)}</span>
                </div>
              </div>

              <div className="divide-y">
                {timeRows.map((row) => {
                  const matched = events.filter((ev) => eventMatchesRow(ev, row));

                  return (
                    <div key={row.start} className="flex items-stretch">
                      <div className="w-28 shrink-0 px-4 py-3 text-xs text-gray-500">
                        <div>{row.start}</div>
                        <div>{row.end}</div>
                      </div>

                      <div className="flex-1 px-4 py-3 text-sm text-gray-900">
                        {matched.length === 0 ? (
                          <div className="text-gray-300">—</div>
                        ) : (
                          <div className="space-y-2">
                            {matched.map((c) => {
                              const key = c.teacherId || c.teacherName || "no-trainer";
                              const col = colorFromKey(key);

                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => onEditClass?.(c)}
                                  className="w-full text-left rounded-xl border px-3 py-2 hover:opacity-90"
                                  style={{ background: col.bg, borderColor: col.border, color: col.text }}
                                  title="Click to edit"
                                >
                                  <div className="font-semibold">{c.title}</div>
                                  <div className="text-xs opacity-80">
                                    {c.teacherName ? `Trainer: ${c.teacherName}` : "Trainer: —"}
                                    {c.locationName ? ` • ${c.locationName}` : ""}
                                    {typeof c.price === "number" ? ` • $${c.price}` : ""}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-3">Tip: click a class to edit it.</div>
    </div>
  );
}
