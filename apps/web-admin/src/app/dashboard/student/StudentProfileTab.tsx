"use client";

import React from "react";
import { User, Ticket, LogOut } from "lucide-react";

export default function StudentProfileTab() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="text-xs uppercase tracking-widest text-gray-500">Student</div>
      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Profile</h3>
      <p className="text-gray-600 mt-2">Your account info and bookings.</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <div className="rounded-2xl border border-gray-200 p-5">
          <div className="font-extrabold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-orange-500" />
            Account
          </div>

          <div className="mt-4 text-sm text-gray-700 space-y-2">
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-semibold">Student (demo)</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-semibold">student@example.com</div>
            </div>
          </div>

          <button
            onClick={() => alert("Logout UI ready ✅ (wire backend later)")}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:border-gray-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 p-5">
          <div className="font-extrabold text-gray-900 flex items-center gap-2">
            <Ticket size={18} className="text-orange-500" />
            My bookings
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No bookings yet.
          </div>
        </div>
      </div>
    </div>
  );
}
