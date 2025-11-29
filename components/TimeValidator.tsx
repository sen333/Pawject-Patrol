"use client";

import React from "react";

export default function TimeValidator({ nowMin }: { nowMin: string }) {
  React.useEffect(() => {
    function pad(n: number) { return n.toString().padStart(2, '0'); }
    function toLocal(dt: Date) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) + 'T' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()); }

    const start = document.querySelector('input[name="call_starttime"]') as HTMLInputElement | null;
    const end = document.querySelector('input[name="call_endtime"]') as HTMLInputElement | null;
    if (!start) return; // if start input missing there's nothing to validate client-side

    // capture a non-null reference so closures use a stable element
    const startEl = start as HTMLInputElement;

    // ensure start.min is at least now
    try { startEl.min = toLocal(new Date()); } catch (e) { /* ignore */ }

    let boundStartChange = false;
    if (end) {
      if (startEl.value) end.min = startEl.value;
      boundStartChange = true;
    }

    function onStartChange() {
      if (end && startEl.value) end.min = startEl.value;
    }

    function onSubmit(e: Event) {
      try {
        const s = startEl && startEl.value ? new Date(startEl.value) : null;
        const en = end && end.value ? new Date(end.value) : null;
        const now = new Date();
        if (s && s.getTime() < now.getTime()) {
          e.preventDefault();
          // eslint-disable-next-line no-alert
          alert('Start time must not be before the current date and time');
          startEl.focus();
          return;
        }
        if (en && s && en.getTime() < s.getTime()) {
          e.preventDefault();
          // eslint-disable-next-line no-alert
          alert('End time must not be before start time');
          end?.focus();
          return;
        }
      } catch (err) {
        // if anything unexpected happens, allow server-side validation to catch it
      }
    }

    if (boundStartChange) startEl.addEventListener('change', onStartChange);
    const form = startEl.form;
    form?.addEventListener('submit', onSubmit);

    return () => {
      if (boundStartChange) startEl.removeEventListener('change', onStartChange);
      form?.removeEventListener('submit', onSubmit);
    };
  }, [nowMin]);

  return null;
}
