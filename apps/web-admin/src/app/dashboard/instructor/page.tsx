"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Clock3, Flame, CalendarCheck2, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ClassForm } from "../../../components/dashboard/ClassForm";
import { ClassList } from "../../../components/dashboard/ClassList";
import { fetchClasses, type ClassEvent } from "../../../lib/classes";
import { useAuthUser } from "../../../lib/useAuthUser";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { user, role, loading } = useAuthUser();

  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [slots, setSlots] = useState<ClassEvent[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // ✅ Hard guard
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (role && role !== "instructor") {
      router.replace("/dashboard");
    }
  }, [user, role, loading, router]);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  // ✅ Load only if instructor
  useEffect(() => {
    if (loading) return;
    if (!user?.uuid) return;
    if (role !== "instructor") return;

    const load = async () => {
      setSlotsLoading(true);
      try {
        const data = await fetchClasses({ trainer: user.uuid });
        setSlots(data);
      } catch (err) {
        console.warn("Failed to load instructor slots", err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    load();
  }, [user?.uuid, role, loading, refreshTrigger]);

  const stats = useMemo(() => {
    const now = Date.now();
    const upcoming = slots.filter((s) => s.startAt > now);
    const next = [...upcoming].sort((a, b) => a.startAt - b.startAt)[0];

    const seatsTaken = upcoming.reduce((sum, s) => sum + (s.reservedCount ?? 0), 0);
    const seatsCapacity = upcoming.reduce((sum, s) => sum + (s.capacity || 0), 0);

    return {
      nextClass: next ? new Date(next.startAt).toLocaleString() : "No upcoming",
      booked: `${seatsTaken} / ${seatsCapacity || 1}`,
      upcomingCount: upcoming.length,
    };
  }, [slots]);

  const selectedClass = useMemo(
    () => slots.find((s) => s.id === selectedClassId),
    [slots, selectedClassId]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={22} />
          Loading instructor dashboard...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(99,102,241,0.12),transparent_25%)]" />

        <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase">
                Teaching Hub
              </p>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                Instructor Dashboard
              </h1>
              <p className="text-lg text-slate-600 mt-3 max-w-2xl">
                Schedule, track, and refine every class with a clear split of what is coming up and what is behind you.
              </p>
            </div>

            {!showForm && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:translate-y-[-1px] transition-all"
                >
                  <Plus size={18} />
                  Schedule New Class
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:border-slate-300 shadow-sm"
                >
                  <Sparkles size={18} />
                  Templates
                </button>
              </div>
            )}
          </header>

          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Clock3 size={20} />,
                label: "Next class",
                value: stats.nextClass,
                tone: "from-emerald-500/10 to-teal-500/5",
              },
              {
                icon: <Flame size={20} />,
                label: "Booked seats",
                value: stats.booked,
                tone: "from-orange-500/10 to-amber-500/5",
              },
              {
                icon: <CalendarCheck2 size={20} />,
                label: "Upcoming sessions",
                value: `${stats.upcomingCount}`,
                tone: "from-indigo-500/10 to-slate-500/5",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                <div className="relative flex items-center gap-3">
                  <div className="rounded-xl bg-white text-slate-700 p-2.5 shadow-sm border border-slate-100">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {slotsLoading ? "Loading..." : item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {showForm && (
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-white shadow-sm p-4">
              <ClassForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
            </div>
          )}

          <section className="mt-12 grid gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pipeline</p>
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Classes</h2>
              <p className="text-sm text-slate-500 mb-4">Everything you need to prepare.</p>

              <ClassList
                refreshTrigger={refreshTrigger}
                filter="upcoming"
                onViewRoster={setSelectedClassId}
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">History</p>
              <h2 className="text-2xl font-bold text-slate-900">Past Classes</h2>
              <p className="text-sm text-slate-500 mb-4">Review outcomes and attendance.</p>

              <ClassList
                refreshTrigger={refreshTrigger}
                filter="past"
                onViewRoster={setSelectedClassId}
              />
            </div>
          </section>

          <Dialog open={!!selectedClassId} onOpenChange={(open) => !open && setSelectedClassId(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Class Roster: {selectedClass?.title ?? "Class"}</DialogTitle>
                <DialogDescription>
                  Manage attendance and view student details for this session.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                <div className="rounded-lg border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-50/50 text-xs text-center text-slate-500">
                    Roster UI placeholder (backend hookup next).
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
}
