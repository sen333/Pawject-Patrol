// NOTE: This is only a prompted user landing page used to test backend, not yet the final version

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function UserDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);
      setLoading(false);
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-200 via-yellow-100 to-yellow-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-200 via-yellow-100 to-yellow-50 flex items-center justify-center">
      <div className="w-full max-w-3xl p-8 bg-white/80 rounded-2xl shadow-lg backdrop-blur-md">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">User Dashboard</h1>
          <nav className="space-x-4">
            <button
              onClick={handleLogout}
              className="text-sm text-purple-700 hover:underline"
            >
              Logout
            </button>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 p-6 bg-amber-50 rounded-xl border border-amber-100">
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Welcome to Pawject Patrol</h2>
            <p className="text-sm text-amber-700">
              This is your user dashboard. From here you can browse the catalog, view your activity, and manage your account.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/catalog" className="inline-block px-4 py-2 rounded-md bg-purple-600 text-white text-sm shadow hover:bg-purple-700">
                Browse Catalog
              </Link>
              <Link href="#" className="inline-block px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50">
                My Activity
              </Link>
              <Link href="#" className="inline-block px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50">
                Settings
              </Link>
            </div>
          </div>

          <aside className="p-6 bg-pink-50 rounded-xl border border-pink-100">
            <h3 className="text-lg font-medium text-pink-900 mb-2">Quick Info</h3>
            <ul className="text-sm text-pink-700 space-y-2">
              <li>Logged in as: <strong>{email ?? "—"}</strong></li>
              <li>Role: User</li>
              <li>Welcome back!</li>
            </ul>
          </aside>
        </section>

        <footer className="mt-8 text-xs text-gray-500">Pawject Patrol — Youth For Animals UP Mindanao</footer>
      </div>
    </main>
  );
}
