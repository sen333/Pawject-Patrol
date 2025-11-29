"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

type Volunteer = {
  call_id: string;
  call_title: string;
  call_details?: string | null;
  call_starttime?: string | null;
  call_endtime?: string | null;
  call_location?: string | null;
  capacity?: number | null;
  filled?: number | null;
  call_status?: string | null;
};

function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("filled")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return d.toLocaleString();
  }
}

export default function VolunteerList() {
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("volunteer_call")
        .select("call_id, call_title, call_details, call_starttime, call_endtime, call_location, capacity, call_status")
        .order("call_starttime", { ascending: false })
        .limit(200);
      if (!mounted) return;
      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        setItems((data || []) as Volunteer[]);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (it.call_title || "").toLowerCase().includes(q) ||
      (it.call_details || "").toLowerCase().includes(q) ||
      (it.call_location || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Volunteer Requests</h2>
          <p className="text-sm text-gray-600">Manage upcoming volunteer opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/volunteer/request" className="px-3 py-2 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700">Create Request</Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:underline">Admin Home</Link>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, details, or location..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      {loading && <div className="py-8 text-center text-gray-500">Loading volunteer calls…</div>}
      {error && <div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">No volunteer requests found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((it) => (
          <div key={it.call_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{it.call_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{it.call_details || '—'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(it.call_status)}`}>
                  {it.call_status || 'Pending'}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <div>{formatDateTime(it.call_starttime)}{it.call_endtime ? ` - ${formatDateTime(it.call_endtime)}` : ''}</div>
                <div className="mt-2">{it.call_location || ''} {it.capacity ? ` - ${it.filled || 0}/${it.capacity}` : ''}</div>
              </div>
              <div className="mt-4 text-right">
                <Link href={`/admin/volunteer/${it.call_id}`} className="text-xs text-purple-700 hover:underline">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
