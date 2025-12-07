

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, LogIn, FileText, PawPrint, Users, MapPin, Calendar, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { 
  getUserDashboardStats, 
  getCommunityStats, 
  getUserRecentReports,
  getUpcomingVolunteerCalls,
  getRecentCatalogAnimals
} from "@/actions/dashboard/user";

// Type definitions
type ReportData = {
  report_id: string;
  report_title: string | null;
  reporter_name: string | null;
  animal_name: string | null;
  animal_type: string | null;
  animal_gender: string | null;
  date_seen: string | null;
  animal_description: string | null;
  area: string | null;
  landmark: string | null;
  road: string | null;
  health_issues: string | null;
  animal_collar: string | null;
  other_information: string | null;
  latitude: number | null;
  longitude: number | null;
  report_status: string | null;
  photo_url: string | null;
  created_at: string | null;
};

type VolunteerCall = {
  call_id: string;
  call_title: string | null;
  call_starttime: string | null;
  call_location: string | null;
  capacity: number | null;
  call_status: string | null;
};

type CatalogAnimal = {
  animal_id: string;
  animal_name: string | null;
  animal_species: string | null;
  animal_breed: string | null;
  animal_gender: string | null;
  animal_description: string | null;
  animal_status: string | null;
  animal_photo: string | null;
  area: string | null;
  animal_collar: string | null;
  animal_theme: string | null;
  vaccination_status?: string | null;
  health_issues?: string | null;
  created_at: string | null;
};

export default function UserDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [communityStats, setCommunityStats] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);
  const [volunteerCalls, setVolunteerCalls] = useState<VolunteerCall[]>([]);
  const [userJoinedCalls, setUserJoinedCalls] = useState<string[]>([]);
  const [catalogAnimals, setCatalogAnimals] = useState<CatalogAnimal[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedCatalogAnimal, setSelectedCatalogAnimal] = useState<CatalogAnimal | null>(null);
  const [showAllReports, setShowAllReports] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      setUserName(name);
      
      // Fetch all dashboard data
      const [statsData, communityData, reportsData, volunteersData, catalogData] = await Promise.all([
        getUserDashboardStats(),
        getCommunityStats(),
        getUserRecentReports(50),
        getUpcomingVolunteerCalls(50),
        getRecentCatalogAnimals(3)
      ]);
      
      if (isMounted) {
        setStats(statsData);
        setCommunityStats(communityData);
        setRecentReports(reportsData.data || []);
        setVolunteerCalls(volunteersData.data || []);
        setUserJoinedCalls(volunteersData.userJoined || []);
        setCatalogAnimals(catalogData.data || []);
        console.log('Dashboard data loaded:', {
          stats: statsData,
          reports: reportsData.data?.length,
          volunteers: volunteersData.data?.length,
          catalogAnimals: catalogData.data?.length,
          catalogData
        });
        setLoading(false);
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Handle user logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Helper functions
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getThemeColor = (theme: string | null): string => {
    const themeMap: Record<string, string> = {
      blue: "#5E9BBA",
      green: "#689668",
      orange: "#DCB57E",
      pink: "#C575AD",
      purple: "#8D52A7",
    };
    return themeMap[theme?.toLowerCase() || ''] || "#689668";
  };

  // Report Detail Modal Component
  const ReportDetailModal = ({ report, onClose }: { report: ReportData | null; onClose: () => void }) => {
    if (!report) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full my-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image Section */}
          <div className="relative h-80 w-full overflow-hidden">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 flex justify-center items-center rounded-full border border-white/60 backdrop-blur-md z-50 transition-all duration-200 hover:bg-white/20 hover:scale-105"
              style={{
                width: "36px",
                height: "36px",
                background: "transparent",
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Report Photo */}
            {report.photo_url ? (
              <img
                src={report.photo_url}
                alt={report.report_title || 'Report'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <PawPrint className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
              <h2 className="text-3xl font-extrabold" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                {report.report_title || 'Untitled Report'}
              </h2>
              <p className="text-sm font-medium" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                {report.animal_type || 'Unknown Animal'}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6" style={{ fontFamily: '"Genty Sans", sans-serif', backgroundColor: '#C2C876', color: '#3C3333' }}>
            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.report_status)}`}>
                {report.report_status || 'Pending'}
              </span>
            </div>

            {/* Report Details */}
            <div className="space-y-3">
              {/* Report ID */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <h3 className="font-semibold mb-1 text-xs">Report ID</h3>
                <p className="text-sm">{report.report_id}</p>
              </div>

              {/* Reporter Information */}
              {report.reporter_name && (
                <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <h3 className="font-semibold mb-1 text-xs">Reported By</h3>
                  <p className="text-sm">{report.reporter_name}</p>
                </div>
              )}

              {/* Animal Information */}
              <div className="grid grid-cols-2 gap-3">
                {report.animal_name && (
                  <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                    <h3 className="font-semibold mb-1 text-xs">Animal Name</h3>
                    <p className="text-sm">{report.animal_name}</p>
                  </div>
                )}
                {report.animal_gender && (
                  <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                    <h3 className="font-semibold mb-1 text-xs">Gender</h3>
                    <p className="text-sm capitalize">{report.animal_gender}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {report.animal_description && (
                <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <h3 className="font-semibold mb-1 text-xs">Description</h3>
                  <p className="text-sm">{report.animal_description}</p>
                </div>
              )}

              {/* Location Details */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <h3 className="font-semibold mb-2 text-xs">Location</h3>
                <div className="space-y-1 text-sm">
                  {report.area && <p><span className="font-medium">Area:</span> {report.area}</p>}
                  {report.landmark && <p><span className="font-medium">Landmark:</span> {report.landmark}</p>}
                  {report.road && <p><span className="font-medium">Road:</span> {report.road}</p>}
                </div>
              </div>

              {/* Health & Collar */}
              <div className="grid grid-cols-2 gap-3">
                {report.health_issues && (
                  <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                    <h3 className="font-semibold mb-1 text-xs">Health Issues</h3>
                    <p className="text-sm">{report.health_issues}</p>
                  </div>
                )}
                {report.animal_collar && (
                  <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                    <h3 className="font-semibold mb-1 text-xs">Collar</h3>
                    <p className="text-sm">{report.animal_collar}</p>
                  </div>
                )}
              </div>

              {/* Other Information */}
              {report.other_information && (
                <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <h3 className="font-semibold mb-1 text-xs">Additional Information</h3>
                  <p className="text-sm">{report.other_information}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <h3 className="font-semibold mb-1 text-xs">Date Seen</h3>
                  <p className="text-sm">{formatDate(report.date_seen)}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <h3 className="font-semibold mb-1 text-xs">Submitted On</h3>
                  <p className="text-sm">{formatDate(report.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
              style={{ backgroundColor: '#3C3333', color: '#E6E6E6' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Catalog Animal Detail Modal Component
  const CatalogAnimalModal = ({ animal, onClose }: { animal: CatalogAnimal | null; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<"details" | "health">("details");
    
    if (!animal) return null;

    const color = getThemeColor(animal.animal_theme);
    const hoverColors: Record<string, string> = {
      "#689668": "#5E875E",
      "#DCB57E": "#C6A371",
      "#5E9BBA": "#558CA7",
      "#C575AD": "#B1699C",
      "#8D52A7": "#7F4A96",
    };
    const hoverColor = hoverColors[color] || color;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full my-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image Section */}
          <div className="relative h-80 w-full overflow-hidden">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 flex justify-center items-center rounded-full border border-white/60 backdrop-blur-md z-50 transition-all duration-200 hover:bg-white/20 hover:scale-105"
              style={{
                width: "36px",
                height: "36px",
                background: "transparent",
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Animal Photo */}
            {animal.animal_photo ? (
              <img
                src={animal.animal_photo}
                alt={animal.animal_name || 'Animal'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>
                <PawPrint className="w-16 h-16 text-white/50" />
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
              <h2 className="text-3xl font-extrabold" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                {animal.animal_name || 'Unknown'}
              </h2>
              <p className="text-sm font-medium" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                {animal.animal_breed || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6" style={{ fontFamily: '"Genty Sans", sans-serif', backgroundColor: color, color: '#E6E6E6' }}>
            <p className="mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {animal.area || 'CSM'}
            </p>

            {/* Quick Info Pills */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Pill 1 - Species */}
              <div
                className="flex flex-col justify-between items-center flex-[1_0_0] rounded-[10px] border border-white/60 backdrop-blur-md text-center"
                style={{
                  height: "53.999px",
                  padding: "5px 9px",
                  backgroundColor: "rgba(0,0,0,0.15)",
                }}
              >
                <PawPrint className="w-5 h-5 mx-auto" />
                <span className="text-xs">{animal.animal_species || 'Unknown'}</span>
              </div>

              {/* Pill 2 - Gender */}
              <div
                className="flex flex-col justify-between items-center flex-[1_0_0] rounded-[10px] border border-white/60 backdrop-blur-md text-center"
                style={{
                  height: "53.999px",
                  padding: "5px 9px",
                  backgroundColor: "rgba(0,0,0,0.15)",
                }}
              >
                {animal.animal_gender?.toLowerCase() === 'male' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4v6h-2V7.425l-3.975 3.95q.475.7.725 1.488T15 14.5q0 2.3-1.6 3.9T9.5 20q-2.3 0-3.9-1.6T4 14.5q0-2.3 1.6-3.9T9.5 9q.825 0 1.625.237t1.475.738L16.575 6H14V4h6zM9.5 11q-1.45 0-2.475 1.025T6 14.5q0 1.45 1.025 2.475T9.5 18q1.45 0 2.475-1.025T13 14.5q0-1.45-1.025-2.475T9.5 11z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4q2.3 0 3.9 1.6T17.5 9.5q0 1.425-.575 2.7T15.3 14.5l.7.7V18h2.5v2H16v2.5h-2V20H11.5v-2H14v-2.8l-.7-.7q-1.05.65-2.325 1.075T8.5 16q-2.3 0-3.9-1.6T3 10.5q0-2.3 1.6-3.9T8.5 5q2.3 0 3.9 1.6T14 10.5q0 .825-.237 1.625T13.025 13.6l.7.7.7-.7q.575-1.05.825-2.1T15.5 9.5q0-1.45-1.025-2.475T12 6q-1.45 0-2.475 1.025T8.5 9.5q0 1.45 1.025 2.475T12 13z"/>
                  </svg>
                )}
                <span className="text-xs">{animal.animal_gender || 'Unknown'}</span>
              </div>

              {/* Pill 3 - Collar */}
              <div
                className="flex flex-col justify-between items-center flex-[1_0_0] rounded-[10px] border border-white/60 backdrop-blur-md text-center"
                style={{
                  height: "53.999px",
                  padding: "5px 9px",
                  backgroundColor: "rgba(0,0,0,0.15)",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="text-xs">
                  {animal.animal_collar && animal.animal_collar.toLowerCase() !== 'none'
                    ? 'Has Collar'
                    : 'Has No Collar'}
                </span>
              </div>
            </div>

            {/* Tab Slider */}
            <div
              className="flex mb-4"
              style={{
                padding: "5px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                alignSelf: "stretch",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.60)",
                background: hoverColor,
              }}
            >
              <button
                onClick={() => setActiveTab("details")}
                className="flex-1 py-2 rounded font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === "details" ? "rgba(255, 255, 255, 0.25)" : "transparent",
                  color: "#E6E6E6",
                }}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("health")}
                className="flex-1 py-2 rounded font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === "health" ? "rgba(255, 255, 255, 0.25)" : "transparent",
                  color: "#E6E6E6",
                }}
              >
                Health
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="mt-4 text-sm min-h-[120px]">
              {activeTab === "details" && (
                <>
                  {animal.animal_description ? (
                    <>
                      <p className="font-semibold mb-2">Physical Description:</p>
                      <p className="leading-relaxed text-justify">
                        {animal.animal_description}
                      </p>
                    </>
                  ) : (
                    <p className="text-center py-8 opacity-70">
                      No details available
                    </p>
                  )}
                </>
              )}
              {activeTab === "health" && (
                <div className="space-y-4">
                  {animal.vaccination_status || animal.health_issues ? (
                    <>
                      {animal.vaccination_status && (
                        <div>
                          <p className="font-semibold mb-1">Vaccination Status:</p>
                          <p className="leading-relaxed">{animal.vaccination_status}</p>
                        </div>
                      )}
                      {animal.health_issues && animal.health_issues.toLowerCase() !== 'none' && (
                        <div>
                          <p className="font-semibold mb-1">Health Issues:</p>
                          <p className="leading-relaxed">{animal.health_issues}</p>
                        </div>
                      )}
                      {(!animal.health_issues || animal.health_issues.toLowerCase() === 'none') && animal.vaccination_status && (
                        <div>
                          <p className="font-semibold mb-1">Health Issues:</p>
                          <p className="leading-relaxed">None</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center py-8 opacity-70">
                      No health information available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-[375px] bg-[#E1E69D] z-40 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
        style={{
          display: 'flex',
          padding: '24px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Top Section */}
        <div className="flex flex-col gap-6 items-center w-full">
          {/* Logo */}
          <Image
            src="/YFALogo.png"
            alt="Youth for Animals Logo"
            width={92}
            height={77}
          />

          <div className="flex flex-col gap-6 items-center w-full">
            {/* Account Information */}
            <div
              className="w-full"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '5px',
                alignSelf: 'stretch',
                borderRadius: '16px',
                border: '1px solid #3C3333',
                backgroundColor: '#E6E6E6',
                padding: '12px',
              }}
            >
              {userName ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm" style={{ color: '#3C3333', fontFamily: 'Genty Sans', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>{userName}</span>
                    <span className="text-xs text-gray-600" style={{ color: '#3C3333', fontSize: '12px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal' }}>{email}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-4">
                  <span className="text-sm font-semibold text-gray-700">You are not logged in.</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav
              className="w-full"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '5px',
                alignSelf: 'stretch',
                borderRadius: '16px',
                border: '1px solid #3C3333',
                backgroundColor: '#E6E6E6',
                padding: '12px',
              }}
            >
              {[
                { label: 'Home', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: 'About Us', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: 'Mission', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0)">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                    </g>
                  </svg>
                )},
                { label: 'Vision', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
                  </svg>
                )},
                { label: 'Goals', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986" stroke="#689668" strokeWidth="2"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="#689668" strokeWidth="2"/>
                  </svg>
                )}
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push('/');
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Animal Actions Section */}
        <div
          className="w-full"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '5px',
            alignSelf: 'stretch',
            borderRadius: '16px',
            border: '1px solid #000',
            backgroundColor: '#E6E6E6',
            padding: '12px',
            marginTop: '24px',
          }}
        >
          <Link
            href="/catalog"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Animal Catalogue</span>
          </Link>

          <Link
            href="/form"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path d="M20.42 4.58C19.92 4.08 19.32 3.68 18.67 3.4C18.01 3.13 17.31 2.99 16.6 2.99C15.89 2.99 15.18 3.13 14.52 3.4C13.87 3.68 13.27 4.08 12.77 4.58L12 5.36L11.23 4.58C10.73 4.08 10.13 3.68 9.48 3.4C8.82 3.13 8.12 2.99 7.41 2.99C6.7 2.99 5.99 3.13 5.33 3.4C4.68 3.68 4.08 4.08 3.58 4.58C1.46 6.7 1.33 10.28 4 13L12 21L20 13C22.67 10.28 22.54 6.7 20.42 4.58Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Report Animal</span>
          </Link>

          <Link
            href="/volunteer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <g clipPath="url(#clip0)">
                  <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                  <path d="M12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                  <path d="M12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                </g>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Task Volunteer</span>
          </Link>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-6">
          <a href="#" className="bg-[#C575AD] p-2 rounded-full text-white hover:opacity-80">
            <Facebook size={18} />
          </a>
          <a href="#" className="bg-[#8D52A7] p-2 rounded-full text-white hover:opacity-80">
            <Instagram size={18} />
          </a>
          <a href="#" className="bg-[#5E9BBA] p-2 rounded-full text-white hover:opacity-80">
            <Twitter size={18} />
          </a>
          <a href="#" className="bg-[#9BBF94] p-2 rounded-full text-white hover:opacity-80">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </>
  );

  // Return loading state
  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E6E6E6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Report Detail Modal */}
      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />

      {/* Catalog Animal Modal */}
      <CatalogAnimalModal animal={selectedCatalogAnimal} onClose={() => setSelectedCatalogAnimal(null)} />

      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
          <div className="flex-1 flex justify-center items-center h-full">
            <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <LogIn className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-8" style={{ backgroundColor: '#E6E6E6' }}>
        <div className="max-w-6xl mx-auto px-6">
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
            Welcome back, {userName}!
          </h2>
          <p className="text-xs sm:text-sm md:text-md mb-6" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Track your contributions and stay updated with community activities
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5" style={{ color: '#5E9BBA' }} />
                <span className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
                  {stats?.totalReports || 0}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Reports Submitted</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <PawPrint className="w-5 h-5" style={{ color: '#689668' }} />
                <span className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
                  {stats?.acceptedReports || 0}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Reports Accepted</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5" style={{ color: '#C575AD' }} />
                <span className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
                  {stats?.volunteersJoined || 0}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Volunteers Joined</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/form" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
              <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#5E9BBA' }} />
              <p className="font-semibold text-sm mb-1" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Report Animal</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Submit a sighting</p>
            </Link>

            <Link href="/catalog" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
              <PawPrint className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#689668' }} />
              <p className="font-semibold text-sm mb-1" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Browse Catalog</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>View animals</p>
            </Link>

            <Link href="/volunteer" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
              <Users className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#C575AD' }} />
              <p className="font-semibold text-sm mb-1" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Volunteer</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>Join opportunities</p>
            </Link>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
              My Recent Reports
            </h3>
            <div className="flex items-center gap-3">
              <Link href="/form" className="text-sm hover:underline" style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}>
                Submit New →
              </Link>
            </div>
          </div>
          
          {recentReports.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentReports.slice(0, showAllReports ? recentReports.length : 3).map((report) => (
                <div key={report.report_id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    {report.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.photo_url} alt={report.report_title || 'Animal'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PawPrint className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full border ${getStatusColor(report.report_status)}`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                      {report.report_status || 'Pending'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2 truncate" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {report.report_title || 'Untitled Report'}
                    </h4>
                    
                    <p className="text-xs text-gray-600 mb-2" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                      {report.animal_type || 'Unknown Animal'} • {formatDate(report.date_seen)}
                    </p>

                    {report.area && (
                      <p className="text-xs text-gray-500 mb-3 truncate" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {report.area}
                      </p>
                    )}

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="inline-block w-full text-center px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                      style={{ backgroundColor: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {recentReports.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllReports(!showAllReports)}
                  className="px-6 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: '#C2C876', color: '#E6E6E6', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  {showAllReports ? 'Show Less' : `See More (${recentReports.length - 3} more)`}
                </button>
              </div>
            )}
          </>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                You haven't submitted any reports yet
              </p>
              <Link href="/form" className="inline-block px-4 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{ backgroundColor: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}>
                Submit Your First Report
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Volunteer Opportunities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
              My Upcoming Volunteer Opportunities
            </h3>
            <Link href="/volunteer" className="text-sm hover:underline" style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}>
              View All →
            </Link>
          </div>
          
          {volunteerCalls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {volunteerCalls.map((call) => {
                // Determine if the call is ongoing based on time
                const now = new Date();
                const startTime = call.call_starttime ? new Date(call.call_starttime) : null;
                const isUpcoming = startTime && startTime > now;
                const callStatus = (call.call_status || '').toLowerCase();
                
                return (
                  <Link 
                    key={call.call_id} 
                    href={`/volunteer/${call.call_id}`}
                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-sm flex-1" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                        {call.call_title || 'Volunteer Opportunity'}
                      </h4>
                      <div className="flex gap-2">
                        {callStatus === 'ongoing' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                            Ongoing
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                          Joined
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-600" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateTime(call.call_starttime)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        <MapPin className="w-4 h-4 mr-2" />
                        {call.call_location || 'Location TBA'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                You haven't joined any volunteer opportunities yet
              </p>
              <Link href="/volunteer" className="inline-block px-4 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{ backgroundColor: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}>
                Browse Opportunities
              </Link>
            </div>
          )}
        </div>

        {/* Recent Catalog Animals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#3C3333', fontFamily: '"Kawaii RT", sans-serif' }}>
              Animals in Catalog
            </h3>
            <Link href="/catalog" className="text-sm hover:underline" style={{ color: '#C2C876', fontFamily: '"Genty Sans", sans-serif' }}>
              Browse All →
            </Link>
          </div>
          
          {catalogAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {catalogAnimals.slice(0, 3).map((animal) => (
                <button
                  key={animal.animal_id}
                  onClick={() => setSelectedCatalogAnimal(animal)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left w-full"
                >
                  <div 
                    className="aspect-video relative"
                    style={{ backgroundColor: getThemeColor(animal.animal_theme) }}
                  >
                    {animal.animal_photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={animal.animal_photo} alt={animal.animal_name || 'Animal'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PawPrint className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-xs truncate" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {animal.animal_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 truncate" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                      {animal.animal_species || 'Animal'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                No animals in catalog yet
              </p>
              <p className="text-xs text-gray-400" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                Check back soon for animal profiles
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="py-6 border-t" style={{ backgroundColor: '#E6E6E6', borderColor: '#d1d1d1' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
            Pawject Patrol — Youth For Animals UP Mindanao
          </p>
        </div>
      </footer>
    </main>
  );
}
