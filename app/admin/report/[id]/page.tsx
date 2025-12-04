// NOTE: This is a temporarily prompted admin report detail page to test backend, not yet the final version
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase/client";
import { updateReportStatus } from "@/actions/form/admin";

// Dynamically import the AdminMapView component for client-side rendering only
const AdminMapView = dynamic(() => import("@/components/AdminMapView"), { ssr: false });

// Define the ReportData type to match the database schema
type ReportData = {
  report_id: string;
  animal_name: string | null;
  animal_type: string | null;
  animal_gender: string | null;
  date_seen: string | null;
  animal_description: string | null;
  area: string | null;
  landmark: string | null;
  road: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  report_status: string | null;
  health_issues?: string | null;
  animal_collar?: string | null;
  other_information?: string | null;
  report_theme?: string | null;
};

// Admin report detail page component - displays full report information and allows status updates
export default function AdminReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // State management for report data and UI states
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<string>('Pending');

  // Fetch report data on component mount
  useEffect(() => {
    // Mounting flag to prevent state updates after unmount
    let mounted = true;

    // Fetch data with authentication and authorization checks
    const fetchData = async () => {
      // Await params
      const resolvedParams = await params;
      const reportId = resolvedParams.id;
      
      // Set report ID in state
      if (!mounted) return;
      setId(reportId);

      // Validate report ID
      if (!reportId || reportId.trim() === '') {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!mounted) return;
      
      // Handle authentication errors
      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Verify user is an admin
      const { data: admin, error: adminError } = await supabase
        .from("admin")
        .select("auth_id")
        .eq("auth_id", user.id)
        .maybeSingle();

      // Check if component is still mounted
      if (!mounted) return;

      // Handle admin check errors
      if (adminError || !admin) {
        setError('Unauthorized');
        setLoading(false);
        return;
      }

      // Fetch complete report data from database
      const { data: reportData, error: reportError } = await supabase
        .from("animal_report")
        .select("*")
        .eq("report_id", reportId)
        .single();

      if (!mounted) return;

      // Handle report fetch errors
      if (reportError || !reportData) {
        console.error("Report fetch error:", reportError);
        setError(`Report not found (ID: ${reportId})`);
        setLoading(false);
        return;
      }

      // Set report data and status in state
      setData(reportData);
      setStatus(reportData.report_status || 'Pending');
      setLoading(false);
    };

    // Execute fetch on mount
    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, [params]);

  // Handle report status updates (Accept/Reject)
  const handleStatusUpdate = async (newStatus: 'Accepted' | 'Rejected') => {
    // Validate data presence
    if (!data) return;
    
    // Update status in backend
    setUpdating(true);

    // Call the updateReportStatus action
    const result = await updateReportStatus(data.report_id, newStatus);

    // Handle result
    if (result.success) {
      setStatus(newStatus);
      router.refresh();
    } else {
      // Show error alert on failure
      alert(`Failed to update status: ${result.error}`);
    }
    // Finalize updating state
    setUpdating(false);
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E6E6E6' }}>
        <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Loading...</p>
      </main>
    );
  }

  // Show error state if data fetch failed
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{error || 'Report not found'}</p>
          <Link 
            href="/admin/report" 
            className="text-xs mt-2 inline-block hover:opacity-90"
            style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}
          >
            ← Back to reports
          </Link>
        </div>
      </main>
    );
  }

  // Determine border/shadow color based on report theme
  const themeAccent = data.report_theme === 'blue'
    ? 'border-[#1F4E79] shadow-[0_0_0_3px_rgba(31,78,121,0.15)]'
    : data.report_theme === 'green'
      ? 'border-[#2F5E4E] shadow-[0_0_0_3px_rgba(47,94,78,0.15)]'
      : data.report_theme === 'orange'
        ? 'border-[#C26437] shadow-[0_0_0_3px_rgba(194,100,55,0.15)]'
        : data.report_theme === 'purple'
          ? 'border-[#5C2F74] shadow-[0_0_0_3px_rgba(92,47,116,0.15)]'
          : 'border-gray-200';

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
        <div className="max-w-4xl mx-auto px-6">
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
            Report Details
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            View and manage report information
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        {/* Header with status badge and action buttons */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/admin/report" 
            className="text-sm hover:opacity-90"
            style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}
          >
            ← Back to reports
          </Link>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              status === 'Accepted' ? 'bg-green-100 text-green-700' :
              status === 'Rejected' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
              {status}
            </span>
            {status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate('Accepted')}
                  disabled={updating}
                  className="px-3 py-1 text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: '#689668', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  {updating ? 'Updating...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={updating}
                  className="px-3 py-1 text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main report card with theme-based border */}
        <div className={`bg-white rounded-2xl p-6 md:p-8 border-2 shadow-lg transition-colors ${themeAccent}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Animal photo */}
            <div className="md:col-span-1">
              <div className="w-full aspect-square bg-gray-100 rounded-lg border overflow-hidden flex items-center justify-center">
                {data.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.photo_url} alt={data.animal_name ?? 'Animal'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>No photo</span>
                )}
              </div>
            </div>

            {/* Animal details */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Animal Name</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_name ?? 'Unnamed'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Type</label>
                  <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_type ?? '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Gender</label>
                  <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_gender ?? 'unknown'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Date Seen</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.date_seen ? new Date(data.date_seen).toLocaleString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Physical Description</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_description ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Area</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.area ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Landmark</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.landmark ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Road</label>
                <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.road ?? '—'}</p>
              </div>
            </div>
            {/* Optional additional information (health, collar, other) */}
            {(data.health_issues || data.animal_collar || data.other_information) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Additional Details</h3>
                <div className="space-y-2 text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                  {data.health_issues && (
                    <p><span className="font-medium" style={{ color: '#6B7280' }}>Health Issues:</span> {data.health_issues}</p>
                  )}
                  {data.animal_collar && (
                    <p><span className="font-medium" style={{ color: '#6B7280' }}>Collar:</span> {data.animal_collar}</p>
                  )}
                  {data.other_information && (
                    <p><span className="font-medium" style={{ color: '#6B7280' }}>Other Info:</span> {data.other_information}</p>
                  )}
                </div>
              </div>
            )}
            {/* Interactive map view if coordinates are available */}
            {data.latitude && data.longitude && (
              <div className="mt-4" id="map-section">
                <label className="text-xs font-medium block mb-2" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>Map View</label>
                <AdminMapView latitude={data.latitude} longitude={data.longitude} />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs mt-2 inline-block hover:opacity-90"
                  style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  View on OpenStreetMap →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
