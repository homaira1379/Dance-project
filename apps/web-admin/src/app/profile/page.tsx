"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { useAuthUser } from "../../lib/useAuthUser";
import { signOut, updateProfile } from "../../lib/auth";

export default function ProfilePage() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("F");
  const [danceLevel, setDanceLevel] = useState("Beginner");
  const [interests, setInterests] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Load user data into form
  useEffect(() => {
    if (!user) return;

    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setPhone(user.phone_number || "");
    setGender(user.gender || "F");
    setDanceLevel(user.dance_level || "Beginner");
    setInterests((user.interests || []).join(", "));
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        gender,
        dance_level: danceLevel,
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      setStatus("Profile updated successfully.");
    } catch (err: any) {
      setStatus(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <Loader2 className="animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-500">
              Signed in as <strong>{user.email}</strong>
            </span>

            <button
              onClick={signOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        {status && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            My Profile
          </h1>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={user.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Dance Level
              </label>
              <select
                value={danceLevel}
                onChange={(e) => setDanceLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Interests (comma separated)
              </label>
              <input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
