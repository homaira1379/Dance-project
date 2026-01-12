"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../lib/useAuthUser";
import type { UserRole } from "../lib/auth";

/* ---------- helpers ---------- */

function scrollToId(id: string) {
  const el = document.querySelector(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openAuth(mode: "signin" | "signup", role?: UserRole) {
  window.dispatchEvent(
    new CustomEvent("open-auth", { detail: { mode, role } })
  );
}

/* ---------- component ---------- */

export function Hero() {
  const router = useRouter();
  const { user, role, loading } = useAuthUser();

  const dashboardPath = useMemo(() => {
    if (!role) return "/dashboard";
    const slugMap: Record<UserRole, string> = {
      owner: "owner",
      instructor: "instructor",
      student: "student",
    };
    return `/dashboard/${slugMap[role]}`;
  }, [role]);

  const handleTrainerClick = () => {
    if (!loading && user) {
      router.push(dashboardPath);
      return;
    }
    openAuth("signup", "instructor");
  };

  const handleStudioClick = () => {
    if (!loading && user) {
      router.push(dashboardPath);
      return;
    }
    openAuth("signup", "owner");
  };

  const handleStartDancing = () => {
    scrollToId("#classes");
  };

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex items-center justify-center text-white"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="Dance background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-14">
        <span className="inline-block mb-6 rounded-full bg-orange-500/90 px-5 py-2 text-sm font-semibold">
          Revolution in the dance world
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Dance<span className="text-orange-500">Link</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-10">
          A platform connecting dancers, trainers, and studios. Find your style,
          book classes, and grow with the community.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleStartDancing}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3 font-semibold transition inline-flex items-center gap-2 shadow-lg"
          >
            Start dancing <span aria-hidden>→</span>
          </button>

          <button
            onClick={handleTrainerClick}
            className="bg-white/10 border border-white/30 hover:border-white/60 text-white rounded-xl px-8 py-3 font-semibold transition"
          >
            I’m a trainer
          </button>

          <button
            onClick={handleStudioClick}
            className="bg-white/10 border border-white/30 hover:border-white/60 text-white rounded-xl px-8 py-3 font-semibold transition"
          >
            I have a studio
          </button>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
            <div className="text-3xl font-bold text-orange-400">500+</div>
            <div className="text-gray-200 mt-1">Dance studios</div>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
            <div className="text-3xl font-bold text-orange-400">1200+</div>
            <div className="text-gray-200 mt-1">Professional trainers</div>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
            <div className="text-3xl font-bold text-orange-400">15k+</div>
            <div className="text-gray-200 mt-1">Active dancers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
