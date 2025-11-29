"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimeValidator from "@/components/TimeValidator";

type FormState = {
  title: string;
  call_details: string;
  call_location: string;
  call_starttime: string;
  call_endtime: string;
  capacity: number | '';
  status: string;
};

export default function VolunteerCreateForm({ nowMin }: { nowMin: string }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    title: '',
    call_details: '',
    call_location: '',
    call_starttime: '',
    call_endtime: '',
    capacity: '',
    status: 'Pending',
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('volunteerCallFormData');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setState((s) => ({
        ...s,
        title: parsed.title || '',
        call_details: parsed.call_details || '',
        call_location: parsed.call_location || '',
        call_starttime: parsed.call_starttime || '',
        call_endtime: parsed.call_endtime || '',
        capacity: parsed.capacity ?? '',
        status: parsed.status || 'Pending',
      }));
    } catch (err) {
      // ignore
    }
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const snapshot = {
      ...state,
      capacity: typeof state.capacity === 'number' ? state.capacity : (parseInt(String(state.capacity || '0'), 10) || 0),
    } as any;

    try {
      sessionStorage.setItem('volunteerCallFormData', JSON.stringify(snapshot));
    } catch (err) {
      console.error('failed to persist snapshot', err);
    }

    router.push('/admin/volunteer/request/confirm');
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
      <div>
        <label className="text-xs">Title</label>
        <input name="title" value={state.title} onChange={(e) => setField('title', e.target.value)} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="text-xs">Details</label>
        <input name="call_details" value={state.call_details} onChange={(e) => setField('call_details', e.target.value)} className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="text-xs">Location</label>
        <input name="call_location" value={state.call_location} onChange={(e) => setField('call_location', e.target.value)} className="w-full border rounded p-2" placeholder="Neighborhood, landmark, or address" />
      </div>
      <div>
        <label className="text-xs">Start time</label>
        <input name="call_starttime" type="datetime-local" value={state.call_starttime} onChange={(e) => setField('call_starttime', e.target.value)} className="w-full border rounded p-2" required min={nowMin} />
      </div>
      <div>
        <label className="text-xs">End time</label>
        <input name="call_endtime" type="datetime-local" value={state.call_endtime} onChange={(e) => setField('call_endtime', e.target.value)} className="w-full border rounded p-2" />
      </div>
      <TimeValidator nowMin={nowMin} />
      <div>
        <label className="text-xs">Capacity</label>
        <input name="capacity" type="number" value={state.capacity as any} onChange={(e) => setField('capacity', e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="text-xs">Status</label>
        <select name="status" value={state.status} onChange={(e) => setField('status', e.target.value)} className="w-full border rounded p-2">
          <option>Pending</option>
          <option>Active</option>
          <option>Filled</option>
          <option>Cancelled</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Proceed to Confirm</button>
      </div>
    </form>
  );
}
