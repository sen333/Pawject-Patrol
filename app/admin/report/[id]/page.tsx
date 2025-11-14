"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase/client";
import { updateReportStatus } from "@/actions/form/admin";

const AdminMapView = dynamic(() => import("@/components/AdminMapView"), { ssr: false });

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

export default function AdminReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<string>('Pending');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      // Await params
      const resolvedParams = await params;
      const reportId = resolvedParams.id;
      
      if (!mounted) return;
      setId(reportId);

      if (!reportId || reportId.trim() === '') {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!mounted) return;
      
      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Check admin status
      const { data: admin, error: adminError } = await supabase
        .from("admin")
        .select("auth_id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (adminError || !admin) {
        setError('Unauthorized');
        setLoading(false);
        return;
      }

      // Fetch report data
      const { data: reportData, error: reportError } = await supabase
        .from("animal_report")
        .select("*")
        .eq("report_id", reportId)
        .single();

      if (!mounted) return;

      if (reportError || !reportData) {
        console.error("Report fetch error:", reportError);
        setError(`Report not found (ID: ${reportId})`);
        setLoading(false);
        return;
      }

      setData(reportData);
      setStatus(reportData.report_status || 'Pending');
      setLoading(false);
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [params]);

  const handleStatusUpdate = async (newStatus: 'Accepted' | 'Rejected') => {
    if (!data) return;
    
    setUpdating(true);
    const result = await updateReportStatus(data.report_id, newStatus);
    if (result.success) {
      setStatus(newStatus);
      router.refresh();
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm">Loading...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm">{error || 'Report not found'}</p>
          <Link href="/admin/form" className="text-xs text-purple-700 hover:underline mt-2 inline-block">
            ← Back to reports
          </Link>
        </div>
      </main>
    );
  }

  // Compute a color class for the report theme to tint accents
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
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/admin/form" className="text-sm text-purple-700 hover:underline">← Back to reports</Link>
        
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-semibold">Report Details</h1>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              status === 'Accepted' ? 'bg-green-100 text-green-700' :
              status === 'Rejected' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status}
            </span>
            {status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate('Accepted')}
                  disabled={updating}
                  className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={updating}
                  className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-6 bg-white rounded-xl p-6 border-2 transition-colors ${themeAccent}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="md:col-span-1">
              <div className="w-full aspect-square bg-gray-100 rounded-lg border overflow-hidden flex items-center justify-center">
                {data.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.photo_url} alt={data.animal_name ?? 'Animal'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">No photo</span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Animal Name</label>
                <p className="text-sm">{data.animal_name ?? 'Unnamed'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <p className="text-sm">{data.animal_type ?? '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Gender</label>
                  <p className="text-sm">{data.animal_gender ?? 'unknown'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Date Seen</label>
                <p className="text-sm">{data.date_seen ? new Date(data.date_seen).toLocaleString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Physical Description</label>
                <p className="text-sm">{data.animal_description ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Area</label>
                <p className="text-sm">{data.area ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Landmark</label>
                <p className="text-sm">{data.landmark ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Road</label>
                <p className="text-sm">{data.road ?? '—'}</p>
              </div>
            </div>
            {/* Additional Info */}
            {(data.health_issues || data.animal_collar || data.other_information) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Additional Details</h3>
                <div className="space-y-2 text-sm">
                  {data.health_issues && (
                    <p><span className="font-medium text-gray-600">Health Issues:</span> {data.health_issues}</p>
                  )}
                  {data.animal_collar && (
                    <p><span className="font-medium text-gray-600">Collar:</span> {data.animal_collar}</p>
                  )}
                  {data.other_information && (
                    <p><span className="font-medium text-gray-600">Other Info:</span> {data.other_information}</p>
                  )}
                </div>
              </div>
            )}
            {/* Theme visual is now represented by colored border / glow; textual theme removed */}
            {data.latitude && data.longitude && (
              <div className="mt-4" id="map-section">
                <label className="text-xs font-medium text-gray-500 block mb-2">Map View</label>
                <AdminMapView latitude={data.latitude} longitude={data.longitude} />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:underline mt-2 inline-block"
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
