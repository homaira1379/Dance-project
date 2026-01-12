"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../lib/useAuthUser";
import { Loader2 } from "lucide-react";

type RoleSlug = "owner" | "instructor" | "student";

const slugMap: Record<RoleSlug, string> = {
  owner: "owner",
  instructor: "instructor",
  student: "student",
};

export default function DashboardPage() {
  const { user, role, loading } = useAuthUser();
  const router = useRouter();

  // wait a bit for role to arrive (avoid wrong redirect to student)
  const [waitMs, setWaitMs] = useState(0);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    // role not ready yet → wait max 800ms
    if (!role) {
      if (waitMs >= 800) {
        router.replace("/dashboard/student");
        return;
      }
      const t = setTimeout(() => setWaitMs((ms) => ms + 200), 200);
      return () => clearTimeout(t);
    }

    const safeRole = (role as RoleSlug) ?? "student";
    const slug = slugMap[safeRole] ?? "student";
    router.replace(`/dashboard/${slug}`);
  }, [user, role, loading, router, waitMs]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>

        <h1 className="text-xl font-bold text-white">Loading your dashboard</h1>
        <p className="mt-2 text-sm text-white/70">
          Redirecting you to the right place…
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
        </div>
      </div>
    </div>
  );
}
