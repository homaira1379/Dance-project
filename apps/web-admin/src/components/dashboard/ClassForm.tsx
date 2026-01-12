"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createClass, type CreateClassInput } from "../../lib/classes";
import { useAuthUser } from "../../lib/useAuthUser";
import { listStudios, type Studio } from "../../lib/studios";
import { fetchTrainers, type Trainer } from "../../lib/trainers";
import { fetchDanceStyles, type DanceStyle } from "../../lib/danceStyles";

interface ClassFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClassForm({ onSuccess, onCancel }: ClassFormProps) {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [studios, setStudios] = useState<Studio[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [styles, setStyles] = useState<DanceStyle[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateClassInput>>({
    title: "",
    description: "",
    price: 0,
    capacity: 10,
    studioId: "",
    trainerId: "",
    danceStyleId: "",
  });

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const canSubmit = useMemo(
    () => Boolean(formData.title && formData.studioId && startDate && startTime),
    [formData.title, formData.studioId, startDate, startTime],
  );

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [studiosData, trainersData, stylesData] = await Promise.all([
          listStudios(),
          fetchTrainers(),
          fetchDanceStyles(),
        ]);
        setStudios(studiosData);
        setTrainers(trainersData);
        setStyles(stylesData);
        
        if (!formData.studioId && studiosData.length) {
          setFormData((prev) => ({ ...prev, studioId: studiosData[0].uuid }));
        }
      } catch (err) {
        console.warn("Failed to load form data", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [formData.studioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please fill in title, studio, date, and time.");
      return;
    }
    setLoading(true);
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      await createClass({
        studioId: formData.studioId!,
        title: formData.title!,
        description: formData.description || "",
        price: Number(formData.price || 0),
        capacity: Number(formData.capacity || 1),
        startAt: start,
        endAt: end,
        trainerId: formData.trainerId || user?.uuid, // Fallback to current user if trainer
        danceStyleId: formData.danceStyleId,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">New Slot</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Class Title *</label>
          <input
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Salsa Beginner 1"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Studio *</label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            value={formData.studioId ?? ""}
            onChange={(e) => setFormData({ ...formData, studioId: e.target.value })}
            disabled={loadingData}
          >
            {!formData.studioId && <option value="">Select a studio</option>}
            {studios.map((s) => (
              <option key={s.uuid} value={s.uuid}>
                {s.name} {s.city ? `• ${s.city}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Trainer</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            value={formData.trainerId ?? ""}
            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
            disabled={loadingData}
          >
            <option value="">No specific trainer</option>
            {trainers.map((t) => (
              <option key={t.uuid} value={t.uuid}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Dance Style</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            value={formData.danceStyleId ?? ""}
            onChange={(e) => setFormData({ ...formData, danceStyleId: e.target.value })}
            disabled={loadingData}
          >
            <option value="">Select a style</option>
            {styles.map((s) => (
              <option key={s.uuid} value={s.uuid}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Date *</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Start Time *</label>
          <input
            type="time"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Duration (min)</label>
          <input
            type="number"
            min="15"
            step="15"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What will be taught in this class?"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {loading ? "Creating..." : "Create Slot"}
        </button>
      </div>
    </form>
  );
}
