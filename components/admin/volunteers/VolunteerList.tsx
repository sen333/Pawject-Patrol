"use client";

import React, { useEffect, useState } from "react";
import VolunteerCard from "./VolunteerCard";

type Volunteer = {
  id: string;
  title: string;
  summary?: string;
  start_time?: string;
  location?: string;
  capacity?: number;
  filled?: number;
  status?: string;
};

export default function VolunteerList() {
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  async function fetchList() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch('/api/admin/volunteers?' + params.toString());
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  }

  useEffect(() => { fetchList(); }, [statusFilter]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button onClick={() => setStatusFilter(undefined)} className={`px-3 py-1 rounded ${!statusFilter ? 'bg-gray-200' : 'bg-white'}`}>All</button>
          <button onClick={() => setStatusFilter('Active')} className={`px-3 py-1 rounded ${statusFilter === 'Active' ? 'bg-blue-100' : 'bg-white'}`}>Active</button>
          <button onClick={() => setStatusFilter('Pending')} className={`px-3 py-1 rounded ${statusFilter === 'Pending' ? 'bg-amber-100' : 'bg-white'}`}>Pending</button>
          <button onClick={() => setStatusFilter('Filled')} className={`px-3 py-1 rounded ${statusFilter === 'Filled' ? 'bg-green-100' : 'bg-white'}`}>Filled</button>
        </div>
        <div className="text-xs text-gray-500">{loading ? 'Loading…' : `${items.length} items`}</div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No volunteer requests</div>
        ) : (
          items.map((it) => (
            <VolunteerCard key={it.id} id={it.id} title={it.title} summary={it.summary} start_time={it.start_time} location={it.location} capacity={it.capacity} filled={it.filled} status={it.status} />
          ))
        )}
      </div>
    </div>
  );
}
