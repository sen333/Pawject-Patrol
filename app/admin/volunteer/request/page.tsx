// app/admin/volunteer/request/page.tsx
import React from "react";
import { getUser, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";

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

  // Current time in local timezone for setting min and default values on datetime-local inputs
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - tzOffset);
  const nowMin = localNow.toISOString().slice(0, 16);

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
    <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu className="w-6 h-6 text-gray-800" />
          </Link>
          <div className="flex-1 flex justify-center items-center h-full">
            <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
          </div>
          <Link href="/admin/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <LogIn className="w-6 h-6 text-gray-800" />
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="py-8" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1"
            style={{
              color: '#C2C876',
              WebkitTextStrokeWidth: '.5px',
              WebkitTextStrokeColor: '#3C3333',
              fontFamily: '"Kawaii RT", sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              outlineColor: '#3C3333',
            }}
          >
            Create Volunteer Request
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Create a new volunteer call (admins only)
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-8">
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
          <form action="/admin/volunteer/request/confirm" method="get" className="grid gap-4">
            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Title *</label>
              <input name="call_title" required defaultValue={prefill.call_title} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Details</label>
              <textarea name="call_details" rows={3} defaultValue={prefill.call_details} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Start *</label>
                <input name="call_starttime" type="datetime-local" required defaultValue={prefill.call_starttime || nowMin} min={nowMin} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
              </div>
              <div>
                <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>End</label>
                <input name="call_endtime" type="datetime-local" defaultValue={prefill.call_endtime} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Location</label>
                <input name="call_location" defaultValue={prefill.call_location} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
              </div>
              <div>
                <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Capacity</label>
                <input name="capacity" type="number" min={0} defaultValue={prefill.capacity} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Status</label>
              <select name="call_status" defaultValue={prefill.call_status || 'Pending'} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                <option>Pending</option>
                <option>Active</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <Link 
                href="/admin/volunteer" 
                className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
              >
                Confirm Request
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}