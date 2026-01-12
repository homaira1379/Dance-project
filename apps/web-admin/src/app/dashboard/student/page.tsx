"use client";

import React, { useState } from "react";
import { Home, MapPin, User } from "lucide-react";

import StudentMainTab from "./StudentMainTab";
import StudentMapTab from "./StudentMapTab";
import StudentProfileTab from "./StudentProfileTab";

type TabKey = "main" | "map" | "profile";

export default function StudentPage() {
  const [tab, setTab] = useState<TabKey>("main");

  const tabs: Array<{ key: TabKey; label: string; icon: any }> = [
    { key: "main", label: "Main", icon: Home },
    { key: "map", label: "Map", icon: MapPin },
    { key: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border transition ${
                  active
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {tab === "main" && <StudentMainTab />}
      {tab === "map" && <StudentMapTab />}
      {tab === "profile" && <StudentProfileTab />}
    </div>
  );
}
