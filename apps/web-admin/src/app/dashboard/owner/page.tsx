"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Users, CalendarDays } from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

import OwnerStudiosTab from "./OwnerStudiosTab";
import OwnerTrainersTab from "./OwnerTrainersTab";
import OwnerClassesTab from "./OwnerClassesTab";

type TabKey = "studios" | "trainers" | "classes";

const TABS: Array<{ key: TabKey; label: string; icon: any }> = [
  { key: "studios", label: "Studios", icon: LayoutGrid },
  { key: "trainers", label: "Trainers", icon: Users },
  { key: "classes", label: "Classes & Slots", icon: CalendarDays },
];

export default function OwnerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, loading } = useAuthUser();

  const urlTab = searchParams.get("tab") as TabKey | null;
  const [tab, setTab] = useState<TabKey>("studios");

  /* 🔐 Owner-only guard */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (String(role).toLowerCase() !== "owner") {
      router.replace("/dashboard");
    }
  }, [user, role, loading, router]);

  /* 🔁 Sync tab from URL */
  useEffect(() => {
    if (urlTab && TABS.some((t) => t.key === urlTab)) {
      setTab(urlTab);
    }
  }, [urlTab]);

  function switchTab(next: TabKey) {
    setTab(next);
    router.replace(`/dashboard/owner?tab=${next}`);
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
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
      {tab === "studios" && <OwnerStudiosTab />}
      {tab === "trainers" && <OwnerTrainersTab />}
      {tab === "classes" && <OwnerClassesTab />}
    </div>
  );
}
