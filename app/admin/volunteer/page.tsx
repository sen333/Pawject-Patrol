import React from "react";
import { listVolunteerCalls, createVolunteerCall } from "@/actions/volunteer/admin";
import { getUser } from "@/utils/supabase/server";
import TimeValidator from "@/components/TimeValidator";

type Volunteer = {
  call_id: string;
  call_title: string;
  call_details?: string;
  call_starttime?: string;
  call_endtime?: string;
  call_location?: string;
  capacity?: number;
  filled?: number;
  call_status?: string;
};

// Server component: fetch list on server and render. Creation uses a server action below.
export default async function AdminVolunteerPage() {
  const items: Volunteer[] = await listVolunteerCalls({ limit: 50 });
  const nowMin = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm for datetime-local inputs

  return (
    <main className="min-h-screen bg-[#E1E69D] p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Volunteers</h1>
            <p className="text-sm text-gray-600">Manage volunteer requests and rosters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <section className="bg-[#E6E6E6] p-4 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded bg-gray-200">All</span>
                <span className="px-3 py-1 rounded bg-blue-100">Active</span>
                <span className="px-3 py-1 rounded bg-amber-100">Pending</span>
                <span className="px-3 py-1 rounded bg-green-100">Filled</span>
              </div>
              <div className="text-xs text-gray-500">{items.length} items</div>
            </div>

            <div className="flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">No volunteer requests</div>
              ) : (
                items.map((it) => (
                  <div key={it.call_id} role="button" tabIndex={0} className="flex items-start gap-3 bg-white rounded-md p-3 shadow-sm hover:bg-gray-50 transition cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-sm text-gray-500">V</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{it.call_title}</div>
                          <div className="text-xs text-gray-500">{it.call_details}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${it.call_status === 'Active' ? 'bg-blue-100 text-blue-800' : it.call_status === 'Filled' ? 'bg-green-100 text-green-800' : it.call_status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{it.call_status}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <div>
                          {it.call_starttime ? new Date(it.call_starttime).toLocaleString() : ''}
                          {it.call_endtime ? ` — ${new Date(it.call_endtime).toLocaleString()}` : ''}
                        </div>
                        <div>{it.call_location || ''} {it.capacity ? ` · ${it.filled || 0}/${it.capacity}` : ''}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Create Volunteer Request</h2>
          <CreateForm nowMin={nowMin} />
        </section>
      </div>
    </main>
  );
}

async function createAction(formData: FormData) {
  'use server';
  const title = String(formData.get('title') || '');
  const call_details = String(formData.get('call_details') || '');
  const start_time = String(formData.get('call_starttime') || '');
  const end_time = String(formData.get('call_endtime') || '');
  const capacity = parseInt(String(formData.get('capacity') || '0'), 10) || 0;
  const status = String(formData.get('status') || 'Pending');

  // Server-side validation: start must not be before now, end must not be before start
  if (start_time) {
    const startDate = new Date(start_time);
    if (isNaN(startDate.getTime())) throw new Error('Invalid start time');
    if (startDate.getTime() < Date.now()) throw new Error('Start time must not be before the current date and time');
    if (end_time) {
      const endDate = new Date(end_time);
      if (isNaN(endDate.getTime())) throw new Error('Invalid end time');
      if (endDate.getTime() < startDate.getTime()) throw new Error('End time must not be before start time');
    }
  }

  // Ensure we have the authenticated user id to use as admin_id (to satisfy RLS FK)
  const user = await getUser();
  const adminId = user?.id;
  if (!adminId) {
    throw new Error('You must be signed in as an admin to create volunteer calls.');
  }

  try {
    await createVolunteerCall({ call_title: title, call_details, call_starttime: start_time, call_endtime: end_time, capacity, call_status: status }, adminId);
  } catch (err: any) {
    // Detect FK violation to give actionable advice
    const msg = String(err?.message || err);
    if (/violates foreign key constraint .*volunteer_call_admin_id_fkey/i.test(msg) || err?.code == '23503') {
      // Helpful SQL to add the missing admin row (replace <ADMIN_UUID> with the actual uid)
      const hintSql = `-- If you intend this auth user to be an admin, insert into public.admin:
INSERT INTO public.admin (admin_id, added_at) VALUES ('${adminId}', now());`;
      throw new Error(`Insert failed: admin_id ${adminId} is not present in table public.admin.\nQuick fix (run in Supabase SQL editor):\n${hintSql}`);
    }
    throw err;
  }
}

function CreateForm({ nowMin }: { nowMin: string }) {
  // This is a client form that posts to the server action `createAction` above.
  // To keep this file server-rendered we render a plain HTML form with action pointing to
  // the server action (Next.js will wire it up).
  // Using `formAction` requires the action function to be in scope; we pass its name.
  return (
    // @ts-ignore server-action
    <form action={createAction as unknown as any} className="grid grid-cols-1 gap-3">
      <div>
        <label className="text-xs">Title</label>
        <input name="title" className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="text-xs">Details</label>
        <input name="call_details" className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="text-xs">Start time</label>
        <input name="call_starttime" type="datetime-local" className="w-full border rounded p-2" required min={nowMin} />
      </div>
      <div>
        <label className="text-xs">End time</label>
        <input name="call_endtime" type="datetime-local" className="w-full border rounded p-2" />
      </div>
      {/* Client-side validator component will handle UI checks (no raw innerHTML) */}
      <TimeValidator nowMin={nowMin} />
      <div>
        <label className="text-xs">Capacity</label>
        <input name="capacity" type="number" className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="text-xs">Status</label>
        <select name="status" className="w-full border rounded p-2">
          <option>Pending</option>
          <option>Active</option>
          <option>Filled</option>
          <option>Cancelled</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
      </div>
    </form>
  );
}


