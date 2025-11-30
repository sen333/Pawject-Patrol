import Link from "next/link";
import { getVolunteerCall } from "@/actions/volunteer/admin";
import { updateAction } from "@/actions/volunteer/admin";

function toInputLocal(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  } catch (e) {
    return "";
  }
}

export default async function EditVolunteerPage(props: any) {
  const id = props?.params?.id;
  const v: any = await getVolunteerCall(id);

  if (!v) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="py-24 text-center text-gray-500">Volunteer request not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Volunteer Request</h1>
          <Link href={`/admin/volunteer/${id}`} className="text-sm text-purple-700 hover:underline">← Back to Request</Link>
        </div>

        <form action={updateAction} method="post" className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <input type="hidden" name="id" value={id} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Title *</label>
              <input name="call_title" defaultValue={v.call_title || ''} required className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Park Cleanup" />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Details</label>
              <textarea name="call_details" defaultValue={v.call_details || ''} rows={4} className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Describe the task, expectations, and any special instructions" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Start *</label>
              <input name="call_starttime" type="datetime-local" defaultValue={toInputLocal(v.call_starttime)} required className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">End *</label>
              <input name="call_endtime" type="datetime-local" defaultValue={toInputLocal(v.call_endtime)} required className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <input name="call_location" defaultValue={v.call_location || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. University grounds" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Capacity</label>
              <input name="capacity" type="number" min={0} defaultValue={typeof v.capacity === 'number' ? String(v.capacity) : ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select name="call_status" defaultValue={v.call_status || 'Pending'} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Pending</option>
                <option>Accepted</option>
                <option>Rejected</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button type="submit" className="px-6 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700">Save Changes</button>
            <Link href={`/admin/volunteer/${id}`} className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
