"use client";

import React from "react";

type Props = {
  id: string;
  title: string;
  summary?: string;
  start_time?: string;
  location?: string;
  capacity?: number;
  filled?: number;
  status?: string;
  onClick?: () => void;
};

export default function VolunteerCard({ id, title, summary, start_time, location, capacity = 0, filled = 0, status = "Pending", onClick }: Props) {
  const badgeColor = status === "Active" ? "bg-blue-100 text-blue-800" : status === "Filled" ? "bg-green-100 text-green-800" : status === "Cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";

  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if ((e as any).key === 'Enter') onClick && onClick(); }} className="flex items-start gap-3 bg-white rounded-md p-3 shadow-sm hover:bg-gray-50 transition cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-sm text-gray-500">V</div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500">{summary}</div>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>{status}</div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div>{start_time ? new Date(start_time).toLocaleString() : ''}</div>
          <div>{location || ''} {capacity > 0 ? ` · ${filled}/${capacity}` : ''}</div>
        </div>
      </div>
    </div>
  );
}
