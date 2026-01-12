"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Users, Trash2, Repeat } from "lucide-react";
import { fetchClasses, deleteClass, type ClassEvent } from "../../lib/classes";
import { useAuthUser } from "../../lib/useAuthUser";

type ClassListProps = {
  refreshTrigger: number;
  filter?: "all" | "upcoming" | "past";
  instructorId?: string | null;
  onViewRoster?: (classId: string) => void;
};

export function ClassList({
  refreshTrigger,
  filter = "all",
  instructorId,
  onViewRoster,
}: ClassListProps) {
  const { user } = useAuthUser();
  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setClasses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchClasses({
          trainer: instructorId === null ? undefined : instructorId || user.uuid,
        });
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, refreshTrigger, instructorId]);

  const filteredClasses = useMemo(() => {
    const now = Date.now();
    if (filter === "upcoming") return classes.filter((c) => c.startAt >= now);
    if (filter === "past") return classes.filter((c) => c.startAt < now);
    return classes;
  }, [classes, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    setDeletingId(id);
    try {
      await deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete class.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading schedule...</div>
    );
  }

  if (filteredClasses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">
          {filter === "past"
            ? "No past classes yet."
            : filter === "upcoming"
            ? "No upcoming classes scheduled."
            : "No classes scheduled yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredClasses.map((c) => {
        const reserved = c.reservedCount ?? 0;
        const capacity = c.capacity || 1;
        const percent = Math.min(100, Math.round((reserved / capacity) * 100));
        const barColor =
          percent > 90
            ? "bg-red-400"
            : percent > 70
            ? "bg-amber-400"
            : "bg-emerald-400";

        const levelColor =
          c.level === "beginner"
            ? "bg-green-100 text-green-700"
            : c.level === "intermediate"
            ? "bg-amber-100 text-amber-700"
            : c.level === "advanced"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700";

        return (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group flex flex-col"
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-2 ${levelColor}`}
                >
                  {c.level}
                </span>

                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                  {c.title}
                </h4>

                {c.teacherName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Instructor: {c.teacherName}
                  </p>
                )}
              </div>

              {c.recurringRule && (
                <div
                  title={`Repeats ${c.recurringRule}`}
                  className="text-orange-700 bg-orange-50 border border-orange-100 p-2 rounded-full"
                >
                  <Repeat size={14} />
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{format(new Date(c.startAt), "EEE, MMM d, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>
                  {format(new Date(c.startAt), "h:mm a")} -{" "}
                  {format(new Date(c.endAt), "h:mm a")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{c.locationName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span>
                  {reserved}/{capacity} booked
                  {c.waitlistCount ? ` • ${c.waitlistCount} waitlist` : ""}
                </span>
              </div>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-auto">
              <span className="font-bold text-gray-900">${c.price}</span>

              <div className="flex gap-2">
                {onViewRoster && (
                  <button
                    onClick={() => onViewRoster(c.id)}
                    className="text-orange-700 hover:text-orange-800 p-2 rounded-full hover:bg-orange-50 transition-colors"
                    title="View Roster"
                  >
                    <Users size={18} />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={!!deletingId}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-60"
                  title="Delete Class"
                >
                  {deletingId === c.id ? "..." : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
