import Link from "next/link";
import { listVolunteerCalls, deleteAction } from "@/actions/volunteer/admin";

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

function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("filled")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function formatDateTime(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(value);
  }
}

export default async function AdminVolunteerPage(props: any) {
  // `searchParams` may be a thenable in Next.js; await it before accessing properties.
  const resolvedParams: any = await (props.searchParams as any);
  const search = String(resolvedParams?.search || '');
  const sortBy = String(resolvedParams?.sortBy || '');

  // Map empty -> default 'created_at'
  const column = sortBy || 'created_at';
  const defaultAsc = column === 'call_title' || column === 'call_starttime';

  const items = (await listVolunteerCalls({ search: search || undefined, limit: 200 })) as Volunteer[];

  return (
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-5xl mx-auto p-6">
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

        <div className="mb-4 flex items-center justify-between gap-4">
          <form className="flex-1" method="get">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by title, details, or location..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </form>
          <div className="flex-shrink-0">
            <label className="sr-only" htmlFor="vol-sort">Sort by</label>
            <form method="get">
              <select
                id="vol-sort"
                name="sortBy"
                defaultValue={sortBy}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="">Sort By</option>
                <option value="call_title">Name</option>
                <option value="call_starttime">Start Time</option>
                <option value="created_at">Created At</option>
                <option value="capacity">Capacity</option>
              </select>
            </form>
          </div>
        </div>

        {(!items || items.length === 0) && (
          <div className="text-center py-8 text-gray-500">No volunteer requests found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => (
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
                  <div className="mt-2">{it.call_location || ''}{it.capacity ? ` - ${it.capacity}` : ''}</div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <Link href={`/admin/volunteer/${it.call_id}`} className="text-xs text-purple-700 hover:underline">View</Link>
                  <form action={deleteAction} method="post" className="inline">
                    <input type="hidden" name="id" value={it.call_id} />
                    <button type="submit" className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}