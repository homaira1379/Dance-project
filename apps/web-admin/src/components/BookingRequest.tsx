"use client";

import React, { useState } from "react";
import { createBooking } from "../lib/bookings";

export function BookingRequest() {
  const [className, setClassName] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await createBooking(className.trim());
      setStatus({ type: "success", text: "Booking submitted." });
      setClassName("");
      setPreferredDate("");
      setMessage("");
    } catch (err: any) {
      setStatus({
        type: "error",
        text: err?.message || "Unable to send request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-16 bg-page">
      <div className="max-w-6xl mx-auto px-6">
        {/* DanceLink-style CTA card */}
        <div className="rounded-2xl bg-brand-soft p-10 shadow-soft border border-border">
          <div className="max-w-2xl">
            <p className="uppercase tracking-wide text-sm font-medium text-brand mb-2">
              Book your spot
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Request a class booking <span className="text-brand">directly</span>
            </h2>

            <p className="text-muted mb-8">
              Tell us which class or style you want to join and your preferred time. We’ll confirm availability.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-border rounded-2xl p-6 grid gap-4 md:grid-cols-2"
          >
            {status && (
              <div
                className={[
                  "md:col-span-2 rounded-xl px-4 py-3 border text-sm font-medium",
                  status.type === "error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200",
                ].join(" ")}
              >
                {status.text}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-900">Class / Style *</label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                placeholder="e.g. Beginner Hip Hop, Ballet, Salsa"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-900">Preferred Date & Time</label>
              <input
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                placeholder="e.g. Fridays after 6pm"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Notes</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Any goals, level, or special requests?"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand hover:bg-brand-dark text-white rounded-xl px-6 py-3 font-semibold transition disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Booking Request"}
              </button>

              <p className="text-sm text-muted">
                We usually reply within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
