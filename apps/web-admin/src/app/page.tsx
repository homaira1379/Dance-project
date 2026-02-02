// apps/web-admin/src/app/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HomeSearch } from "../components/HomeSearch";
import { AuthModal } from "../components/AuthModal"; // ✅ named import

import { useAuthUser } from "../lib/useAuthUser";
import { signOut } from "../lib/auth";

export default function Page() {
  const router = useRouter();
  const { user, role, loading } = useAuthUser();

  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
  };

  const dashboardHref =
    role === "owner"
      ? "/dashboard/owner"
      : role === "instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";

  return (
    <div className="min-h-screen bg-page text-slate-900">
      {/* Public Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-extrabold"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                DL
              </span>
              <span>DanceLink</span>
            </Link>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="text-white/80 text-sm">Loading…</div>
              ) : user ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-600"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Push content below fixed header */}
      <div className="pt-16">
        <HomeSearch />
      </div>

      {/* Login Modal */}
      <AuthModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        initialMode="signin"
        initialRole="student"
      />
    </div>
  );
}
