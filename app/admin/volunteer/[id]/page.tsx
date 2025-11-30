import { getVolunteerCall, deleteAction } from "@/actions/volunteer/admin";
import Link from "next/link";

type Volunteer = {
  call_id: string;
  call_title: string | null;
  call_details: string | null;
  call_status: string | null;
  call_starttime: string | null;
  call_endtime: string | null;
  call_location?: string | null;
  capacity?: number | null;
  created_at?: string | null;
};

function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("accepted")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("rejected")) return "bg-red-100 text-red-800 border-red-200";
  if (s.includes("pending")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch (err) {
    return value;
  }
}

export default async function AdminVolunteerDetailPage(props: any) {
  // Next.js may provide `params` as a thenable — await it before accessing properties.
  const resolvedParams: any = await props.params;
  const id = resolvedParams?.id;
  if (!id) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="py-24 text-center text-gray-500">Missing volunteer id.</div>
        </div>
      </main>
    );
  }

  const volunteer: any = await getVolunteerCall(id);

  if (!volunteer) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="py-24 text-center text-gray-500">Volunteer request not found.</div>
        </div>
      </main>
    );
  }

  // Server-rendered page: use a server-action form to delete and redirect.

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Volunteer Request (Admin)</h1>
          <Link href="/admin/volunteer" className="text-sm text-purple-700 hover:underline">← Back to Volunteer Requests</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-28 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center px-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">{(volunteer.call_title && volunteer.call_title[0]) ? volunteer.call_title[0].toUpperCase() : 'V'}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{volunteer.call_title || "Untitled"}</h2>
                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(volunteer.call_status)}`}>
                  {volunteer.call_status || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {volunteer.call_details && (
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">{volunteer.call_details}</p>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Start • End</dt>
                <dd className="text-gray-800">{formatDateTime(volunteer.call_starttime)} &nbsp;•&nbsp; {formatDateTime(volunteer.call_endtime)}</dd>
              </div>

              <div>
                <dt className="font-medium text-gray-600">Location</dt>
                <dd className="text-gray-800">{volunteer.call_location || 'Unknown'}</dd>
              </div>

              <div>
                <dt className="font-medium text-gray-600">Capacity</dt>
                <dd className="text-gray-800">{typeof volunteer.capacity === 'number' ? volunteer.capacity : '—'}</dd>
              </div>

              {/* Removed 'Signed Up' / `filled` count — this app tracks capacity and responses separately */}

              <div>
                <dt className="font-medium text-gray-600">Created</dt>
                <dd className="text-gray-800">{volunteer.created_at ? formatDateTime(volunteer.created_at) : '—'}</dd>
              </div>
            </dl>

            <div className="mt-8 flex gap-3">
              <Link href="/admin/volunteer" className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300">Back</Link>
              <Link href={`/admin/volunteer/${volunteer.call_id}/edit`} className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700">Edit Request</Link>

              <form action={deleteAction}>
                <input type="hidden" name="id" value={volunteer.call_id} />
                <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Delete Request</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
