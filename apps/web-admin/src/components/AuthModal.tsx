"use client";

import React, { useEffect, useId, useState } from "react";
import { X, Mail, Lock, User, Phone } from "lucide-react";
import Link from "next/link";
import {
  signInWithEmail,
  signUpWithEmail,
  sendResetPassword,
  type UserRole,
} from "../lib/auth";

const roleCopy: Record<UserRole, { label: string; description: string }> = {
  owner: {
    label: "Owner",
    description: "Full control of studios, trainers, and billing.",
  },
  instructor: {
    label: "Trainer",
    description: "Create and manage classes you teach.",
  },
  student: {
    label: "Student",
    description: "Book classes and manage your profile.",
  },
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  initialRole?: UserRole;
}

function extractApiError(err: any): string {
  const data = err?.response?.data;

  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  if (typeof data === "string" && data.trim()) return data;

  if (Array.isArray(data)) return data.map(String).join(", ");

  // Example:
  // { username: {message, code}, email: {message, code} }
  if (data && typeof data === "object") {
    const parts: string[] = [];

    for (const [field, value] of Object.entries(data)) {
      if (typeof value === "string") {
        parts.push(`${field}: ${value}`);
        continue;
      }
      if (Array.isArray(value)) {
        parts.push(`${field}: ${value.map(String).join(", ")}`);
        continue;
      }
      if (value && typeof value === "object") {
        const msg = (value as any).message || (value as any).detail || JSON.stringify(value);
        parts.push(`${field}: ${String(msg)}`);
        continue;
      }
      parts.push(`${field}: ${String(value)}`);
    }

    const joined = parts.join(" | ");
    const lower = joined.toLowerCase();

    if (lower.includes("already") || lower.includes("exists") || lower.includes("taken")) {
      return "This email is already registered. Please sign in instead (or use another email).";
    }

    return joined || "Something went wrong. Please try again.";
  }

  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  initialRole = "student",
}: AuthModalProps) {
  const uid = useId();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "F",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => setMode(initialMode), [initialMode]);
  useEffect(() => setRole(initialRole), [initialRole]);

  useEffect(() => {
    if (!isOpen) {
      setInfo(null);
      setError(null);
      setIsSubmitting(false);
      setIsResetting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "F",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    resetForm();
    setRole(initialRole);
    setError(null);
    setInfo(null);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const email = formData.email.trim();
    if (!email) {
      setError("Enter your email to reset your password.");
      return;
    }

    setIsResetting(true);
    try {
      await sendResetPassword(email);
      setInfo("Password reset code sent. Check your inbox.");
    } catch (err: any) {
      setError(extractApiError(err));
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setInfo(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (mode === "signup") {
      if (!formData.firstName.trim()) return setError("First name is required.");
      if (!formData.lastName.trim()) return setError("Last name is required.");
      if (!email.includes("@")) return setError("Please enter a valid email address.");
      if (!formData.phone.trim()) return setError("Phone number is required.");
      if (password.length < 8 || !/[0-9]/.test(password)) return setError("Use at least 8 characters with a number.");
      if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email,
          phone: formData.phone.trim(),
          password,
          role,
          gender: formData.gender,
        });
        setInfo("Account created and signed in successfully.");
      } else {
        const result = await signInWithEmail({ email, password });
        setInfo(`Signed in as ${result.role}.`);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailInputId = `${uid}-email`;
  const passInputId = `${uid}-password`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h2 className="mb-2">{mode === "signin" ? "Welcome Back" : "Join DanceLink"}</h2>
          <p className="text-gray-600">
            {mode === "signin"
              ? "Sign in to access your account and book classes"
              : "Create an account to start your dance journey"}
          </p>
        </div>

        {(error || info) && (
          <div className="px-8 pb-0">
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
                {info}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${uid}-first`} className="block mb-2 text-gray-700">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id={`${uid}-first`}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${uid}-last`} className="block mb-2 text-gray-700">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id={`${uid}-last`}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor={emailInputId} className="block mb-2 text-gray-700">
              {mode === "signin" ? "Email or Username *" : "Email Address *"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id={emailInputId}
                type={mode === "signin" ? "text" : "email"}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={mode === "signin" ? "you@example.com or username" : "you@example.com"}
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor={`${uid}-phone`} className="block mb-2 text-gray-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block mb-2 text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor={passInputId} className="block mb-2 text-gray-700">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id={passInputId}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="********"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use 8+ characters and include a number for stronger security.
            </p>
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor={`${uid}-confirm`} className="block mb-2 text-gray-700">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id={`${uid}-confirm`}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="********"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block mb-2 text-gray-700">Choose a role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(roleCopy) as UserRole[]).map((value) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                      role === value
                        ? "border-orange-500 ring-2 ring-orange-100"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      className="sr-only"
                      checked={role === value}
                      onChange={() => setRole(value)}
                    />
                    <div className="font-semibold text-gray-900">{roleCopy[value].label}</div>
                    <p className="text-sm text-gray-600 mt-1">{roleCopy[value].description}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {mode === "signin" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting || isSubmitting}
                className="text-orange-600 hover:text-orange-700 disabled:opacity-60"
              >
                {isResetting ? "Sending reset..." : "Forgot password?"}
              </button>

              <Link
                href={`/reset?email=${encodeURIComponent(formData.email)}`}
                className="ml-4 text-sm text-gray-500 hover:text-orange-600"
              >
                Enter code
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="px-8 pb-8 text-center">
          <p className="text-gray-600">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={switchMode} className="text-orange-600 hover:text-orange-700">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
