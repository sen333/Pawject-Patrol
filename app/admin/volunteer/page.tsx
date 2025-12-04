// Import necessary modules and types
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";
import { listVolunteerCalls, deleteAction } from "@/actions/volunteer/admin";

// Define Volunteer type
type Volunteer = {
  call_id?: string;
  call_title?: string | null;
  call_details?: string | null;
  call_starttime?: string | null;
  call_endtime?: string | null;
  call_location?: string | null;
  capacity?: number | null;
  created_at?: string | null;
  call_status?: string | null;
};

// Function to determine badge classes based on status
function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("filled")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

// Function to format date and time for display
function formatDateTime(value?: string | null) {
  // Handle empty values
  if (!value) return "";

  // Attempt to format the date
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    // Fallback to returning the original value
    return String(value);
  }
}

// Main component for Admin Volunteer Page
export default function AdminVolunteerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  // Fetch volunteer calls when search or sortBy changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const column = sortBy || 'created_at';
      const defaultAsc = column === 'call_title' || column === 'call_starttime';
      const sortOrder = defaultAsc ? 'asc' : 'desc';

      const data = await listVolunteerCalls({
        search: search || undefined,
        sortBy: column,
        sortOrder: sortOrder,
        limit: 200
      });
      setItems(data as Volunteer[]);
      setLoading(false);
    };

    fetchData();
  }, [search, sortBy]);

  // Update URL when search or sortBy changes
  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    router.push(`/admin/volunteer?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Render the admin volunteer page
  return (
    <>
      {/* Floating Add Volunteer Request Button */}
      <Link
        href="/admin/volunteer/request"
        aria-label="Add Volunteer Request"
        className="fixed bottom-4 right-6 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-[#E1E69D] text-[#3C3333] hover:text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-[#C2C876] transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 animate-pulse">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

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
        <div className="max-w-5xl mx-auto px-6">
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
            Volunteer Requests
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Manage upcoming volunteer opportunities
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <form className="flex-1" onSubmit={handleSearchSubmit}>
            <input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, details, or location..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm"
              style={{ fontFamily: 'Genty Sans' }}
            />
          </form>
          <div className="flex-shrink-0">
            <label className="sr-only" htmlFor="vol-sort">Sort by</label>
            <select
              id="vol-sort"
              name="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              style={{ fontFamily: 'Genty Sans' }}
            >
              <option value="">Sort By</option>
              <option value="call_title">Name</option>
              <option value="call_starttime">Start Time</option>
              <option value="created_at">Created At</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>Loading...</div>
        ) : (!items || items.length === 0) ? (
          <div className="text-center py-8" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>No volunteer requests found.</div>
        ) : null}

        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => (
            <div key={it.call_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>{it.call_title}</h3>
                    <p className="text-sm mt-1" style={{ color: '#6B7280', fontFamily: 'Genty Sans' }}>{it.call_details || '—'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(it.call_status)}`} style={{ fontFamily: 'Genty Sans' }}>
                    {it.call_status || 'Pending'}
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: '#6B7280', fontFamily: 'Genty Sans' }}>
                  <div>{formatDateTime(it.call_starttime)}{it.call_endtime ? ` - ${formatDateTime(it.call_endtime)}` : ''}</div>
                  <div className="mt-2">{it.call_location || ''}{it.capacity ? ` - Capacity: ${it.capacity}` : ''}</div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <Link 
                    href={`/admin/volunteer/${it.call_id}`} 
                    className="px-3 py-1 rounded text-xs font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: 'Genty Sans' }}
                  >
                    View
                  </Link>
                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="id" value={it.call_id} />
                    <button 
                      type="submit" 
                      className="text-xs px-3 py-1 rounded font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: 'Genty Sans' }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
    </>
  );
}