// Import necessary modules and actions
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { getVolunteerCall } from "@/actions/volunteer/admin";
import { updateAction } from "@/actions/volunteer/admin";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Convert a UTC datetime string to local datetime-local input format
function toInputLocal(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  } catch (e) {
    return "";
  }
}

// Main component for Edit Volunteer Page
export default async function EditVolunteerPage(props: any) {
  // Extract volunteer ID from route parameters
  const resolvedParams: any = await props.params;
  const id = resolvedParams?.id;
  const v: any = await getVolunteerCall(id);

  // Handle not found volunteer call
  if (!v) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="py-24 text-center" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Volunteer request not found.</div>
        </div>
      </main>
    );
  }

  // Render the edit volunteer page
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      {/* Navigation header */}
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
        <div className="max-w-4xl mx-auto px-6">
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
            Edit Volunteer Request
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Update volunteer request information
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">

        <form action={updateAction} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <input type="hidden" name="id" value={id} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Title *</label>
              <input name="call_title" defaultValue={v.call_title || ''} required className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} placeholder="e.g. Park Cleanup" />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Details *</label>
              <textarea name="call_details" defaultValue={v.call_details || ''} rows={4} required className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} placeholder="Describe the task, expectations, and any special instructions" />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Start Time *</label>
              <input name="call_starttime" type="datetime-local" defaultValue={toInputLocal(v.call_starttime)} required className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>End Time</label>
              <input name="call_endtime" type="datetime-local" defaultValue={toInputLocal(v.call_endtime)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Location *</label>
              <input name="call_location" defaultValue={v.call_location || ''} required className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} placeholder="e.g. University grounds" />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Capacity</label>
              <input name="capacity" type="number" min={0} defaultValue={typeof v.capacity === 'number' ? String(v.capacity) : ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2" style={{ fontFamily: '"Genty Sans", sans-serif' }} placeholder="Leave empty for unlimited" />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button 
              type="submit" 
              className="px-6 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
            >
              Save Changes
            </button>
            <Link 
              href={`/admin/volunteer/${id}`} 
              className="px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
