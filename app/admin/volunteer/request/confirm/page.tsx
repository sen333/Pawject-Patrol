"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Snapshot = {
  title?: string;
  call_details?: string;
  call_location?: string;
  call_starttime?: string;
  call_endtime?: string;
  capacity?: number;
  status?: string;
};

export default function ConfirmPage() {
  const router = useRouter();
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('volunteerCallFormData');
      if (!raw) return;
      setData(JSON.parse(raw));
    } catch (err) {
      console.error(err);
    }
  }, []);

  function onEdit() {
    // go back to form for editing (form will rehydrate from sessionStorage)
    router.back();
  }

  async function onConfirm() {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/volunteer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Failed to create volunteer call');
        setLoading(false);
        return;
      }
      sessionStorage.removeItem('volunteerCallFormData');
      // navigate to list
      router.push('/admin/volunteer');
    } catch (err: any) {
      setError(String(err?.message || err));
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-yellow-50">
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-gray-600">No data to confirm. <Link href="/admin/volunteer/request" className="text-purple-700">Return to form</Link></p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Confirm Volunteer Request</h1>
            <p className="text-sm text-gray-600">Review before creating</p>
          </div>
          <div>
            <Link href="/admin/volunteer" className="text-sm text-purple-700 hover:underline">← Back to Requests</Link>
          </div>
        </header>

        <section className="bg-white p-4 rounded shadow space-y-3">
          <div>
            <h2 className="font-semibold">Title</h2>
            <p className="text-gray-700">{data.title}</p>
          </div>
          <div>
            <h2 className="font-semibold">Details</h2>
            <p className="text-gray-700">{data.call_details || '-'}</p>
          </div>
          <div>
            <h2 className="font-semibold">Location</h2>
            <p className="text-gray-700">{data.call_location || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold">Start</h2>
              <p className="text-gray-700">{data.call_starttime || '-'}</p>
            </div>
            <div>
              <h2 className="font-semibold">End</h2>
              <p className="text-gray-700">{data.call_endtime || '-'}</p>
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Capacity</h2>
            <p className="text-gray-700">{data.capacity ?? '-'}</p>
          </div>
          <div>
            <h2 className="font-semibold">Status</h2>
            <p className="text-gray-700">{data.status}</p>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex gap-3 justify-end">
            <button onClick={onEdit} type="button" className="px-4 py-2 rounded border">Edit</button>
            <button onClick={onConfirm} type="button" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Creating…' : 'Confirm & Create'}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
