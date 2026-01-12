"use client";

import React from "react";
import { MapPin, Navigation } from "lucide-react";

export default function StudentMapTab() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="text-xs uppercase tracking-widest text-gray-500">Student</div>
      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Studios map</h3>
      <p className="text-gray-600 mt-2">
        Map UI is ready. Once backend provides studio coordinates, we’ll render a real map.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="mx-auto mb-3" />
            <div className="font-semibold">Map placeholder</div>
            <div className="text-sm text-gray-500 mt-1">
              Backend will provide latitude/longitude
            </div>
          </div>
        </div>

        {/* Studio list */}
        <div className="rounded-2xl border border-gray-200 p-5">
          <div className="font-extrabold text-gray-900 flex items-center gap-2">
            <Navigation size={18} className="text-orange-500" />
            Nearby studios
          </div>

          <div className="mt-4 space-y-3">
            {["Dance Masters Studio", "Elevate Dance Studio", "Urban Groove"].map((name) => (
              <div key={name} className="rounded-xl border border-gray-200 p-4">
                <div className="font-bold text-gray-900">{name}</div>
                <div className="text-sm text-gray-600 mt-1">Distance: — km (waiting for GPS)</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
