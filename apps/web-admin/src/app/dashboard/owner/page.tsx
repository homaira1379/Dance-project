"use client";

import React, { useState } from "react";
import { LayoutGrid, Users, CalendarDays } from "lucide-react";

import OwnerStudiosTab from "./OwnerStudiosTab";
import OwnerTrainersTab from "./OwnerTrainersTab";
import OwnerClassesTab from "./OwnerClassesTab";

type TabKey = "studios" | "trainers" | "classes";

export default function OwnerPage() {
  const [tab, setTab] = useState<TabKey>("studios");

  const tabs: Array<{ key: TabKey; label: string; icon: any }> = [
    { key: "studios", label: "Studios", icon: LayoutGrid },
    { key: "trainers", label: "Trainers", icon: Users },
    { key: "classes", label: "Classes & Slots", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
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

      {tab === "studios" && <OwnerStudiosTab />}
      {tab === "trainers" && <OwnerTrainersTab />}
      {tab === "classes" && <OwnerClassesTab />}
    </div>
  );
}
