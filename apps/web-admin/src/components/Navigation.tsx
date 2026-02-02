"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuthUser } from "../lib/useAuthUser";
import { signOut, type UserRole } from "../lib/auth";

type AuthOpenDetail = { mode: "signin" | "signup"; role?: UserRole };

function scrollToId(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authRole, setAuthRole] = useState<UserRole>("student");

  const { user, role, loading } = useAuthUser();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        event.target instanceof Node &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Listen for Hero buttons (open-auth event)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AuthOpenDetail>).detail;
      if (!detail?.mode) return;
      setAuthMode(detail.mode);
      setAuthRole(detail.role ?? "student");
      setIsAuthModalOpen(true);
      setIsMobileMenuOpen(false);
    };
    window.addEventListener("open-auth", handler as EventListener);
    return () =>
      window.removeEventListener("open-auth", handler as EventListener);
  }, []);

  // ✅ DELETE About + Contact from navbar completely
  const navItems: { label: string; href: string }[] = [];

  const openAuthModal = (mode: "signin" | "signup", initialRole?: UserRole) => {
    setAuthMode(mode);
    setAuthRole(initialRole ?? "student");
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const dashboardPath = useMemo(() => {
    if (!role) return "/dashboard";
    const slugMap: Record<UserRole, string> = {
      owner: "owner",
      instructor: "instructor",
      student: "student",
    };
    return `/dashboard/${slugMap[role]}`;
  }, [role]);

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || (user?.email ? user.email[0]?.toUpperCase() : "U");

  const linkClass = `transition-colors hover:text-orange-500 ${
    isScrolled ? "text-gray-700" : "text-white"
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("#top");
            }}
            className="flex items-center space-x-2"
          >
            <div
              className={`transition-colors ${
                isScrolled ? "text-orange-500" : "text-white"
              }`}
            >
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className={`transition-colors font-semibold ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Dance
              <span
                className={`${isScrolled ? "text-orange-500" : "text-orange-400"}`}
              >
                Link
              </span>
            </span>
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {/* navItems intentionally empty now */}

            {!loading && user ? (
              <>
                <Link href={dashboardPath} className={linkClass}>
                  Dashboard
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((v) => !v)}
                    className="flex items-center gap-3 rounded-full px-3 py-1 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border ${
                        isScrolled
                          ? "bg-orange-500 text-white border-orange-300"
                          : "bg-white/20 text-white border-white/40"
                      }`}
                    >
                      {initials}
                    </div>

                    <div
                      className={`${
                        isScrolled ? "text-gray-800" : "text-white"
                      } leading-tight text-left`}
                    >
                      <div className="text-sm font-semibold">
                        {fullName || user.email || "Signed in"}
                      </div>
                      {role && (
                        <div className="text-xs opacity-75 capitalize">{role}</div>
                      )}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserRound size={16} /> Profile
                      </Link>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("signin")}
                  className={linkClass}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-colors ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {/* navItems intentionally empty now */}

            {!loading && user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="block w-full text-left text-gray-700 hover:text-orange-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 text-left text-gray-700 hover:text-orange-600 py-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("signin")}
                  className="block w-full text-left text-gray-700 hover:text-orange-600 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="block w-full bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors text-center"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!user && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
          initialRole={authRole}
        />
      )}
    </nav>
  );
}
