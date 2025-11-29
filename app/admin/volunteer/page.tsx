import React from "react";
// server list call removed; client `VolunteerList` handles fetching
import { getUser, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import VolunteerList from "@/components/VolunteerList";

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
  // Server-side admin authorization: ensure the current user is an admin before rendering.
  const user = await getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const supabase = await createClient();
  const { data: adminRow, error: adminErr } = await supabase.from('admin').select('auth_id').eq('auth_id', user.id).maybeSingle();
  if (adminErr) {
    console.error('admin check error', adminErr);
  }
  if (!adminRow) {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Client-side list component (keeps volunteer requests visible) */}
        <div className="mb-6">
          <VolunteerList />
        </div>

        {/* bottom create container removed; Create Request + Admin Home now in list header */}
      </div>
    </main>
  );
}

// Create form and server action moved to `app/admin/volunteer/request/page.tsx`.


