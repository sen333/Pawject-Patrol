import React from "react";
import { getUser, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VolunteerCreateForm from "@/components/VolunteerCreateForm";

// Server page with server action and client form for creating volunteer requests
export default async function RequestPage() {
  // Require admin user (redirect if not authenticated/authorized)
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const supabase = await createClient();
  const { data: adminRow } = await supabase.from('admin').select('auth_id').eq('auth_id', user.id).maybeSingle();
  if (!adminRow) redirect('/admin/login?error=unauthorized');

  const nowMin = new Date().toISOString().slice(0, 16);

  return (
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Create Volunteer Request</h1>
            <p className="text-sm text-gray-600">Create a new volunteer call (admins only)</p>
          </div>
          <div>
            <Link href="/admin/volunteer" className="text-sm text-purple-700 hover:underline">← Back to Requests</Link>
          </div>
        </header>
        <section className="bg-white p-4 rounded shadow">
          <VolunteerCreateForm nowMin={nowMin} />
        </section>
      </div>
    </main>
  );
}

// create action moved to API route; form UI is now a client component
