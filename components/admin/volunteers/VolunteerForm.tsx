"use client";

import React, { useState } from "react";

export default function VolunteerForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { title, summary, start_time: startTime, capacity, status };
    const res = await fetch('/api/admin/volunteers', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      setTitle(''); setSummary(''); setStartTime(''); setCapacity(0); setStatus('Pending');
      onCreated && onCreated();
    } else {
      const json = await res.json();
      alert('Error: ' + (json?.error || 'unknown'));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
      <div className="flex flex-col gap-2">
        <label className="text-xs">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded p-2" required />

        <label className="text-xs">Summary</label>
        <input value={summary} onChange={(e) => setSummary(e.target.value)} className="border rounded p-2" />

        <label className="text-xs">Start time</label>
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded p-2" required />

        <label className="text-xs">Capacity</label>
        <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || '0'))} className="border rounded p-2" />

        <label className="text-xs">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
          <option>Pending</option>
          <option>Active</option>
          <option>Filled</option>
          <option>Cancelled</option>
        </select>

        <div className="flex justify-end mt-3">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Saving…' : 'Create'}</button>
        </div>
      </div>
    </form>
  );
}
