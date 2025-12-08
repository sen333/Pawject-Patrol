// NOTE: This is a temporarily prompted admin report detail page to test backend, not yet the final version
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase/client";
import { updateReportStatus } from "@/actions/form/admin";

// Dynamically import the AdminMapView component for client-side rendering only
const AdminMapView = dynamic(() => import("@/components/AdminMapView"), { ssr: false });

// Define the ReportData type to match the database schema
type ReportData = {
  report_id: string;
  report_title: string | null;
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
  reporter_name?: string | null;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'location' | 'health'>('overview');
  const [allReportIds, setAllReportIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState(false);

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

      // Fetch all report IDs first to enable navigation
      const { data: allReports, error: allReportsError } = await supabase
        .from("animal_report")
        .select("report_id")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (!allReportsError && allReports) {
        const reportIds = allReports.map(r => r.report_id);
        setAllReportIds(reportIds);
        setTotalReports(reportIds.length);
        const index = reportIds.indexOf(reportId);
        setCurrentIndex(index >= 0 ? index : 0);
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

  // Navigate to previous report
  const goToPrevious = () => {
    if (currentIndex > 0 && allReportIds.length > 0) {
      const prevId = allReportIds[currentIndex - 1];
      router.push(`/admin/report/${prevId}`);
    }
  };

  // Navigate to next report
  const goToNext = () => {
    if (currentIndex < allReportIds.length - 1 && allReportIds.length > 0) {
      const nextId = allReportIds[currentIndex + 1];
      router.push(`/admin/report/${nextId}`);
    }
  };

  // Handle report status updates (Accept/Reject)
  const handleStatusUpdate = async (newStatus: 'Accepted' | 'Rejected' | 'Pending') => {
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
            Animal Report Details
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Review and manage animal sighting reports
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-8">
        {/* Back button and pagination */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/admin/report" 
            className="text-sm hover:opacity-90 inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border"
            style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
          >
            ⚊ All Reports
          </Link>
          <span className="text-sm px-3 py-1 bg-white rounded-lg border" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            {currentIndex + 1} of {totalReports}
          </span>
        </div>

        {/* Main report card with navigation arrows */}
        <div className="relative">
          {/* Left arrow */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              aria-label="Previous report"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Right arrow */}
          {currentIndex < allReportIds.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              aria-label="Next report"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with theme color */}
          <div className="px-6 py-6 relative" style={{ backgroundColor: '#A67BB5' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/90 mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                  Record ID: {data.report_id}
                </p>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                  {data.report_title ?? 'Untitled Report'}
                </h1>
                <p className="text-sm text-white/90" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                  {data.animal_type ?? 'Unknown'} • {data.animal_gender ?? 'Unknown'}
                </p>
              </div>
              <span className={`px-3 py-1 text-white text-xs font-medium rounded-full ${
                status === 'Accepted' ? 'bg-green-500' :
                status === 'Rejected' ? 'bg-red-500' :
                'bg-amber-500'
              }`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                {status}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-b-2 border-[#3C3333] text-[#3C3333]' 
                    : 'text-gray-500 hover:text-[#3C3333]'
                }`}
                style={{ fontFamily: '"Genty Sans", sans-serif' }}
              >
                ⓘ Overview
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'details' 
                    ? 'border-b-2 border-[#3C3333] text-[#3C3333]' 
                    : 'text-gray-500 hover:text-[#3C3333]'
                }`}
                style={{ fontFamily: '"Genty Sans", sans-serif' }}
              >
                🐾 Animal Details
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'location' 
                    ? 'border-b-2 border-[#3C3333] text-[#3C3333]' 
                    : 'text-gray-500 hover:text-[#3C3333]'
                }`}
                style={{ fontFamily: '"Genty Sans", sans-serif' }}
              >
                📍 Location
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'health' 
                    ? 'border-b-2 border-[#3C3333] text-[#3C3333]' 
                    : 'text-gray-500 hover:text-[#3C3333]'
                }`}
                style={{ fontFamily: '"Genty Sans", sans-serif' }}
              >
                ♥ Health
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Animal photo - click to open modal */}
                  <div
                    className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition relative"
                    onClick={() => data.photo_url && setShowImageModal(true)}
                  >
                    {data.photo_url ? (
                      <img
                        src={data.photo_url}
                        alt={data.animal_name ?? 'Animal'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                        </svg>
                        <p className="text-xs" style={{ fontFamily: '"Genty Sans", sans-serif' }}>No photo</p>
                      </div>
                    )}
                  </div>
      {/* Image Modal */}
      {showImageModal && data.photo_url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={data.photo_url}
            alt={data.animal_name ?? 'Animal'}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

                  {/* Summary */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Summary</label>
                    <p className="text-sm leading-relaxed" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.animal_description ?? 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Overview info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Recorded By</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.reporter_name ?? 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Date Seen</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.date_seen ? new Date(data.date_seen).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Location</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.landmark || data.area || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Type</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_type ?? '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Gender</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.animal_gender ?? 'Unknown'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Physical Description</label>
                  <p className="text-sm leading-relaxed" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    {data.animal_description ?? 'No description provided.'}
                  </p>
                </div>
                {data.other_information && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Other Information</label>
                    <p className="text-sm leading-relaxed" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.other_information}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Area</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.area ?? '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Landmark</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.landmark ?? '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Road</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{data.road ?? '—'}</p>
                  </div>
                </div>
                {data.latitude && data.longitude && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-gray-500 block mb-2" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Map View</label>
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
            )}

            {activeTab === 'health' && (
              <div className="space-y-4">
                {data.health_issues ? (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Health Issues</label>
                    <p className="text-sm leading-relaxed" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.health_issues}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>No health issues reported.</p>
                )}
                {data.animal_collar && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Collar</label>
                    <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {data.animal_collar === 'Yes' ? 'Has Collar' : 'No Collar'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons at bottom */}
          <div className="border-t p-6 flex gap-3">
            {status === 'Pending' ? (
              <>
                <button
                  onClick={() => handleStatusUpdate('Accepted')}
                  disabled={updating}
                  className="flex-1 py-3 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 bg-green-500 text-white hover:bg-green-600"
                  style={{ fontFamily: '"Genty Sans", sans-serif' }}
                >
                  ✓ Accept Report
                </button>
                <button
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={updating}
                  className="flex-1 py-3 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
                  style={{ fontFamily: '"Genty Sans", sans-serif' }}
                >
                  ✕ Deny Report
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusUpdate('Pending')}
                disabled={updating}
                className="flex-1 py-3 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 bg-gray-500 text-white hover:bg-gray-600"
                style={{ fontFamily: '"Genty Sans", sans-serif' }}
              >
                ↺ Reset to Pending
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
