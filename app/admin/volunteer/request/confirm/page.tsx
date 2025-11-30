import Link from "next/link";
import { createAction } from "@/actions/volunteer/admin";

// Decode base64-encoded JSON data from query parameter for pre-filling the confirmation page
function decodeData(s?: string) {
  if (!s) return null;
  try {
    const json = Buffer.from(decodeURIComponent(s), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Main component for confirming volunteer request creation
export default function ConfirmPage(props: any) {
  // Extract and decode data from search parameters
  const searchParams = props.searchParams;
  const encoded = searchParams?.data;

  // Load data from encoded parameter or directly from searchParams
  let data: any = decodeData(encoded);

  // Check for individual fields in searchParams if no encoded data
  if (!data && searchParams) {
    // Look for any known keys to determine if data is present
    const anyKeys = ['call_title', 'call_details', 'call_location', 'call_starttime', 'call_endtime', 'capacity', 'call_status', 'status', 'title'];
    
    // Check if any known keys are present in searchParams
    const hasAny = anyKeys.some((k) => typeof searchParams[k] !== 'undefined');

    // If any known keys are found, construct the data object
    if (hasAny) {
      data = {
        call_title: searchParams.call_title || searchParams.title || '',
        call_details: searchParams.call_details || '',
        call_location: searchParams.call_location || '',
        call_starttime: searchParams.call_starttime || '',
        call_endtime: searchParams.call_endtime || '',
        capacity: typeof searchParams.capacity !== 'undefined' ? (searchParams.capacity as string) : undefined,
        call_status: searchParams.call_status || searchParams.status || 'Pending',
      };
    }
  }

  // If no data is available, show a message
  if (!data) {
    // Render message for missing data
    return (
      <main className="min-h-screen bg-yellow-50">
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-gray-600">No data to confirm. <Link href="/admin/volunteer/request" className="text-purple-700">Return to form</Link></p>
        </div>
      </main>
    );
  }

  // Render the confirmation page
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
                    <p className="text-gray-700">{data.call_title || data.title || '-'}</p>
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
            <p className="text-gray-700">{data.call_status || data.status || 'Pending'}</p>
          </div>

          <form action={createAction} method="post" className="flex gap-3 justify-end">
            <input type="hidden" name="call_title" value={data.call_title || data.title || ''} />
            <input type="hidden" name="call_details" value={data.call_details || ''} />
            <input type="hidden" name="call_location" value={data.call_location || ''} />
            <input type="hidden" name="call_starttime" value={data.call_starttime || ''} />
            <input type="hidden" name="call_endtime" value={data.call_endtime || ''} />
            <input type="hidden" name="capacity" value={String(data.capacity ?? '')} />
            <input type="hidden" name="call_status" value={data.call_status || data.status || 'Pending'} />
            {
              // Build an Edit URL that preserves the entered values so the request
              // form can be prefilled when navigating back from Confirm.
            }
            {(() => {
              const params = new URLSearchParams();
              params.set('call_title', String(data.call_title || data.title || ''));
              if (data.call_details) params.set('call_details', String(data.call_details));
              if (data.call_location) params.set('call_location', String(data.call_location));
              if (data.call_starttime) params.set('call_starttime', String(data.call_starttime));
              if (data.call_endtime) params.set('call_endtime', String(data.call_endtime));
              if (typeof data.capacity !== 'undefined' && data.capacity !== null) params.set('capacity', String(data.capacity));
              params.set('call_status', String(data.call_status || data.status || 'Pending'));
              const href = '/admin/volunteer/request?' + params.toString();
              return <Link href={href} className="px-4 py-2 rounded border">Edit</Link>;
            })()}
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Confirm & Create</button>
          </form>
        </section>
      </div>
    </main>
  );
}
