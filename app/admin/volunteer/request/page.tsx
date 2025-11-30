// app/admin/volunteer/request/page.tsx
import React from "react";
import { getUser, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// Page component for creating a volunteer request
export default async function RequestPage(props: any) {
  // Constants for search parameters
  const searchParams = await props.searchParams;
  // Require admin user (redirect if not authenticated/authorized)
  const user = await getUser();
  if (!user) redirect('/admin/login');

  // Check if user is an admin
  const supabase = await createClient();
  const { data: adminRow } = await supabase.from('admin').select('auth_id').eq('auth_id', user.id).maybeSingle();
  if (!adminRow) redirect('/admin/login?error=unauthorized');

  // Current time in ISO format for setting min attribute on datetime-local inputs
  const nowMin = new Date().toISOString().slice(0, 16);

  // Prefill form fields from search parameters if available
  const prefill = {
    call_title: searchParams?.call_title || '',
    call_details: searchParams?.call_details || '',
    call_starttime: searchParams?.call_starttime || '',
    call_endtime: searchParams?.call_endtime || '',
    call_location: searchParams?.call_location || '',
    capacity: searchParams?.capacity || '',
    call_status: searchParams?.call_status || 'Pending',
  };

  // Render the request page
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
          <form action="/admin/volunteer/request/confirm" method="get" className="grid gap-4">
            <div>
              <label className="text-sm font-semibold">Title *</label>
              <input name="call_title" required defaultValue={prefill.call_title} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-sm font-semibold">Details</label>
              <textarea name="call_details" rows={3} defaultValue={prefill.call_details} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Start *</label>
                <input name="call_starttime" type="datetime-local" required defaultValue={prefill.call_starttime || nowMin} min={nowMin} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold">End</label>
                <input name="call_endtime" type="datetime-local" defaultValue={prefill.call_endtime} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Location</label>
                <input name="call_location" defaultValue={prefill.call_location} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold">Capacity</label>
                <input name="capacity" type="number" min={0} defaultValue={prefill.capacity} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Status</label>
              <select name="call_status" defaultValue={prefill.call_status || 'Pending'} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Pending</option>
                <option>Active</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Confirm Request</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}