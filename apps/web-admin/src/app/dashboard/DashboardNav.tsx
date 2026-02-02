"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "../../lib/useAuthUser";
import { signOut } from "../../lib/auth";

export function DashboardNav() {
  const { user, role, loading } = useAuthUser();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    // ignore query string, Next pathname does not include it
    if (href.includes("?")) {
      const [base] = href.split("?");
      return pathname === base;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const items =
    role === "owner"
      ? [
          { label: "Studios", href: "/dashboard/owner" },
          { label: "Trainers", href: "/dashboard/owner/instructors" },
          { label: "Classes & Slots", href: "/dashboard/owner/classes" },
          { label: "Profile", href: "/profile" },
        ]
      : role === "instructor"
      ? [
          { label: "Dashboard", href: "/dashboard/instructor" },
          { label: "Profile", href: "/profile" },
        ]
      : [
          { label: "Home", href: "/dashboard/student" },
          { label: "Profile", href: "/profile" },
        ];

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-slate-900">
          DanceLink
        </Link>

        <nav className="flex items-center gap-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium ${
                isActive(item.href)
                  ? "text-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-600">
            {user.email ?? user.username}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
