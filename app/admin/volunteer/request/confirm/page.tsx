import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";
import { createAction } from "@/actions/volunteer/admin";

// Function to format datetime string for display
function formatDateTime(value?: string) {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  } catch {
    return value;
  }
}

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
      <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-3xl mx-auto p-6">
          <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>No data to confirm. <Link href="/admin/volunteer/request" style={{ color: '#C2C876' }}>Return to form</Link></p>
        </div>
      </main>
    );
  }

  // Render the confirmation page
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu className="w-6 h-6 text-gray-800" />
          </Link>
          <div className="flex-1 flex justify-center items-center h-full">
            <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
          </div>
          <Link href="/admin/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <LogIn className="w-6 h-6 text-gray-800" />
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="py-8" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1"
            style={{
              color: '#C2C876',
              WebkitTextStrokeWidth: '.5px',
              WebkitTextStrokeColor: '#3C3333',
              fontFamily: '"Kawaii RT", sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              outlineColor: '#3C3333',
            }}
          >
            Confirm Volunteer Request
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Review before creating
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-8">
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg space-y-3">
                  <div>
                    <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Title</h2>
                    <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.call_title || data.title || '-'}</p>
                  </div>
          <div>
            <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Details</h2>
            <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.call_details || '-'}</p>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Location</h2>
            <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.call_location || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Start</h2>
              <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{formatDateTime(data.call_starttime)}</p>
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>End</h2>
              <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{formatDateTime(data.call_endtime)}</p>
            </div>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Capacity</h2>
            <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.capacity ?? '-'}</p>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Status</h2>
            <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.call_status || data.status || 'Pending'}</p>
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
              return (
                <Link 
                  href={href} 
                  className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  Edit
                </Link>
              );
            })()}
            <button 
              type="submit" 
              className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
            >
              Confirm & Create
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
