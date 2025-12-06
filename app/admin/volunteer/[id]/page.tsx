// Import necessary modules and actions
import { getVolunteerCall, deleteAction, cancelAction, uncancelAction } from "@/actions/volunteer/admin";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";

// Define Volunteer type
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

// Function to determine badge classes based on status
function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "bg-blue-100 text-blue-800 border-blue-200";
  if (s === "filled") return "bg-green-100 text-green-800 border-green-200";
  if (s === "cancelled") return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

// Function to format date and time for display
function formatDateTime(value?: string | null) {
  // Handle empty values
  if (!value) return "—";

  // Attempt to format the date
  try {
    // Create date object
    const d = new Date(value);

    // Check for invalid date
    if (isNaN(d.getTime())) return value;

    // Format to locale string
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch (err) {
    // Fallback to returning the original value
    return value;
  }
}

// Main component for Admin Volunteer Detail Page
export default async function AdminVolunteerDetailPage(props: any) {
  // Extract volunteer ID from route parameters
  const resolvedParams: any = await props.params;
  const id = resolvedParams?.id;

  // Handle missing ID
  if (!id) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="py-24 text-center" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Missing volunteer id.</div>
        </div>
      </main>
    );
  }

  // Fetch volunteer call details
  const volunteer: any = await getVolunteerCall(id);

  // Handle not found volunteer call
  if (!volunteer) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="py-24 text-center" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Volunteer request not found.</div>
        </div>
      </main>
    );
  }

  // Render the volunteer detail page
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      {/* Navigation header */}
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
        <div className="max-w-5xl mx-auto px-6">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1"
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
            Volunteer Request Details
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            View and manage volunteer request information
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-8">

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-28 flex items-center px-6" style={{ backgroundColor: '#C2C876' }}>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: '#3C3333', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}>{(volunteer.call_title && volunteer.call_title[0]) ? volunteer.call_title[0].toUpperCase() : 'V'}</div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{volunteer.call_title || "Untitled"}</h2>
                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(volunteer.call_status)}`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                  {volunteer.call_status || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {volunteer.call_details && (
              <p className="leading-relaxed mb-6 whitespace-pre-line" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{volunteer.call_details}</p>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Start • End</dt>
                <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{formatDateTime(volunteer.call_starttime)} &nbsp;•&nbsp; {formatDateTime(volunteer.call_endtime)}</dd>
              </div>

              <div>
                <dt className="font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Location</dt>
                <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{volunteer.call_location || 'Unknown'}</dd>
              </div>

              <div>
                <dt className="font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Capacity</dt>
                <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{typeof volunteer.capacity === 'number' ? volunteer.capacity : '—'}</dd>
              </div>

              {/* Removed 'Signed Up' / `filled` count — this app tracks capacity and responses separately */}

              <div>
                <dt className="font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Created</dt>
                <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{volunteer.created_at ? formatDateTime(volunteer.created_at) : '—'}</dd>
              </div>
            </dl>

            <div className="mt-8 flex gap-3">
              <Link 
                href="/admin/volunteer" 
                className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
              >
                Back
              </Link>
              
              {/* Show Edit button only if not cancelled */}
              {volunteer.call_status?.toLowerCase() !== 'cancelled' && (
                <Link 
                  href={`/admin/volunteer/${volunteer.call_id}/edit`} 
                  className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  Edit Request
                </Link>
              )}

              {/* Show Cancel button if not cancelled, or Uncancel button if cancelled */}
              {volunteer.call_status?.toLowerCase() === 'cancelled' ? (
                <form action={uncancelAction}>
                  <input type="hidden" name="id" value={volunteer.call_id} />
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#10B981', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    Uncancel Request
                  </button>
                </form>
              ) : (
                <form action={cancelAction}>
                  <input type="hidden" name="id" value={volunteer.call_id} />
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#F59E0B', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    Cancel Request
                  </button>
                </form>
              )}

              <form action={deleteAction}>
                <input type="hidden" name="id" value={volunteer.call_id} />
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  Delete Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
