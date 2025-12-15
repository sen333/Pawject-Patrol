"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, LogIn, FileText, PawPrint, User, MapPin, Calendar, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { 
  getUserDashboardStats, 
  getCommunityStats, 
  getUserRecentReports,
  getUpcomingVolunteerCalls,
  getRecentCatalogAnimals
} from "@/actions/dashboard/user";
import Sidebar from "@/components/Sidebar";

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
  call_endtime: string | null;
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

  const [activeVolunteerIdx, setActiveVolunteerIdx] = useState(0);
  const router = useRouter();

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [communityStats, setCommunityStats] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);
  const [volunteerCalls, setVolunteerCalls] = useState<VolunteerCall[]>([]);
  const [userJoinedCalls, setUserJoinedCalls] = useState<string[]>([]);
  const [catalogAnimals, setCatalogAnimals] = useState<CatalogAnimal[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedCatalogAnimal, setSelectedCatalogAnimal] = useState<CatalogAnimal | null>(null);
  const [showAllReports, setShowAllReports] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

 const handleOpenReport = (report: ReportData) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const {
        return (
          <main className="min-h-screen bg-[#E6E6E6]">
            {/* Sidebar */}
            <Sidebar
              variant="user"
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userName={userName}
              userEmail={userEmail}
              router={router}
            />

            <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
              <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6 text-gray-800" />
                </button>
                <div className="flex-1 flex justify-center items-center h-full">
                  <Image
                    src="/Moodboard2.png"
                    alt="Pawject Patrol Logo"
                    width={77}
                    height={36}
                    className="flex-shrink-0"
                  />
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition" >
                  <LogIn className="w-6 h-6 text-gray-800" />
                </button>
              </div>
            </header>
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

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
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
  const ReportDetailsModal = ({ report, isOpen, onClose }: { report: ReportData | null; isOpen: boolean; onClose: () => void }) => {
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

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#E1E69D]">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        userEmail={userEmail ?? undefined}
        router={router}
        variant="user"
      />
      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-800" />
            </button>

            <div className="flex-1 flex justify-center items-center h-full">
              <img
                src="/Moodboard2.png"
                alt="Pawject Patrol Logo"
                width={77}
                height={36}
                className="flex-shrink-0"
              />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogIn className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6 w-full">
          {/* Wrapper Container */}
          <div className="bg-[#E1E69D] rounded-2xl p-2 md:p-5 lg:p-8 pl-[24px] pr-[24px]">
            {/* Welcome Message */}
            <div className="flex-1 flex flex-col gap-4 mb-6">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                style={{
                  color: "#E6E6E6",
                  WebkitTextStrokeWidth: ".5px",
                  WebkitTextStrokeColor: "#000",
                  fontFamily: '"Kawaii RT", sans-serif',
                  fontStyle: "normal",
                  lineHeight: "normal",
                  outlineColor: "#3C3333",
                }}
              >
                Welcome back,{" "}
                {userName
                  .split(" ")
                  .map((word, idx, arr) => {
                    const colors = ["#5E9BBA", "#C2C876", "#C575AD"];
                    // Only add space if not the last word
                    return (
                      <span key={idx} style={{ color: colors[idx % colors.length] }}>
                        {word}{idx < arr.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                <span style={{ color: "#C575AD" }}>!</span>
              </h1>

              <p
                className="text-[12px] sm:text-[12px] md:text-[14px]"
                style={{
                  color: "#45556C",
                  fontFamily: '"Genty Sans", sans-serif',
                }}
              >
                Track your contributions and stay updated with community
                activities.
              </p>
            </div>

            {/* --- Dashboard Cards --- */}
            <div className="w-full flex-1">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 gap-6 justify-center">
                {/* Report Submitted Card */}
                <a
                  className="flex flex-1 justify-between w-full box-border"
                  style={{
                    display: "flex",
                    height: "118.087px",
                    padding: "25.044px 25.044px 25.044px",
                    alignItems: "center",
                    borderRadius: "14px",
                    border: "1.052px solid #5E9BBA",
                    background: "#FFF",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)",
                    textDecoration: "none",
                  }}
                >
                  {/* Left Side: Icon Stacked on Title */}
                  <div className="flex flex-col justify-between">
                    {/* Icon */}
                    <FileText className="text-[#5E9BBA] w-[32px] h-[32px]" />
                    {/* Title */}
                    <h2
                      className="text-lg"
                      style={{
                        color: "#3C3333",
                        fontFamily: '"Genty Sans", sans-serif',
                      }}
                    >
                      Reports Submitted
                    </h2>
                  </div>

                  {/* Right Side: The Count/Number */}
                  <div
                    className="text-6xl font-bold"
                    style={{
                      color: "#5E9BBA",
                      fontFamily: '"Genty Sans", sans-serif',
                    }}
                  >
                    {loading ? <span className="animate-pulse">...</span> : stats?.totalReports || 0}
                  </div>
                </a>
                {/* Reports Accepted Card */}
                <a
                  className="flex flex-1 justify-between w-full box-border"
                  style={{
                    display: "flex",
                    height: "118.087px",
                    padding: "25.044px 25.044px 25.044px",
                    alignItems: "center",
                    borderRadius: "14px",
                    border: "1.052px solid #689668",
                    background: "#FFF",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)",
                    textDecoration: "none",
                  }}
                >
                  {/* Left Side: Icon Stacked on Title */}
                  <div className="flex flex-col justify-between">
                    {/* Icon */}
                    <PawPrint className="text-[#689668] w-[32px] h-[32px]" />

                    {/* Title */}
                    <h2
                      className="text-lg"
                      style={{
                        color: "#3C3333",
                        fontFamily: '"Genty Sans", sans-serif',
                      }}
                    >
                      Reports Accepted
                    </h2>
                  </div>

                  {/* Right Side: The Count/Number */}
                  <div
                    className="text-6xl font-bold"
                    style={{
                      color: "#689668",
                      fontFamily: '"Genty Sans", sans-serif',
                    }}
                  >
                    {loading ? <span className="animate-pulse">...</span> : stats?.acceptedReports || 0}
                  </div>
                </a>
                {/* Volunteer Joined Card */}
                <a
                  className="flex flex-1 justify-between w-full box-border"
                  style={{
                    display: "flex",
                    height: "118.087px",
                    padding: "25.044px 25.044px 25.044px",
                    alignItems: "center",
                    borderRadius: "14px",
                    border: "1.052px solid #C575AD",
                    background: "#FFF",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)",
                    textDecoration: "none",
                  }}
                >
                  {/* Left Side: Icon Stacked on Title */}
                  <div className="flex flex-col justify-between">
                    {/* Icon */}
                    <User className="text-[#C575AD] w-[32px] h-[32px]" />

                    {/* Title */}
                    <h2
                      className="text-lg"
                      style={{
                        color: "#3C3333",
                        fontFamily: '"Genty Sans", sans-serif',
                      }}
                    >
                      Volunteers Joined
                    </h2>
                  </div>

                  {/* Right Side: The Count/Number */}
                  <div
                    className="text-6xl font-bold"
                    style={{
                      color: "#C575AD",
                      fontFamily: '"Genty Sans", sans-serif',
                    }}
                  >
                    {loading ? <span className="animate-pulse">...</span> : stats?.volunteersJoined || 0}
                  </div>
                </a>
              </div>

              {/* Volunteer Opportunities Card */}
              <div className="relative flex flex-col items-start gap-[15.989px] mt-8">

                {/* Header Row for My Volunteer Opportunities */}
                <div className="flex items-center justify-between w-full">
                  <h3
                    style={{
                      color: "#5D4037",
                      fontFamily: '"Genty Sans", sans-serif',
                      fontSize: "24px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "32px",
                      width: "327px",
                    }}
                  >
                    My Volunteer Opportunities
                  </h3>

                  {/* Search Button */}
                  <Link
                    href="/volunteer"
                    style={{
                      display: "flex",
                      width: "106px",
                      height: "46px",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                      borderRadius: "16px",
                      background: "#8D52A7",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </Link>
                </div>

                {/* Card Wrapper  */}
                <div className="relative w-full">
                  {/* Left/Right Buttons: Only show if not loading and more than one opportunity */}
                  {(!loading && volunteerCalls.length > 1) && (
                    <>
                      {/* Left Button */}
                      <button
                        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#8D52A7] flex items-center justify-center hover:bg-gray-50 shadow-md transition-transform active:scale-95"
                        onClick={() => setActiveVolunteerIdx((prev) => prev > 0 ? prev - 1 : volunteerCalls.length - 1)}
                        disabled={volunteerCalls.length === 0}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="#8D52A7"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Right Button  */}
                      <button
                        className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#8D52A7] flex items-center justify-center hover:bg-gray-50 shadow-md transition-transform active:scale-95"
                        onClick={() => setActiveVolunteerIdx((prev) => prev < volunteerCalls.length - 1 ? prev + 1 : 0)}
                        disabled={volunteerCalls.length === 0}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="#8D52A7"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* The Card Content */}
                    {loading ? (
                      <div className="flex items-center justify-center w-full"
                        style={{
                          display: "flex",
                          padding: "24px",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "24px",
                          borderRadius: "14px",
                          border: "1px solid #8D52A7",
                          background: "#E6E6E6",
                          boxSizing: "border-box",
                          width: "100%",
                        }}
                      >
                        <span className="animate-pulse text-lg text-gray-500">Loading opportunities...</span>
                      </div>
                    ) : (
                      volunteerCalls[activeVolunteerIdx] && volunteerCalls[activeVolunteerIdx].call_id ? (
                        <div
                          key={volunteerCalls[activeVolunteerIdx]?.call_id || 'active'}
                          style={{
                            display: "flex",
                            padding: "24px",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "24px",
                            borderRadius: "14px",
                            border: "1px solid #8D52A7",
                            background: "#E6E6E6",
                            boxSizing: "border-box",
                            marginRight: "40px",
                            marginLeft: "40px",
                          }}
                        >
                          {/* Title */}
                          <h2
                            className="text-2xl"
                            style={{
                              color: "#8D52A7",
                              fontFamily: '"Genty Sans", sans-serif',
                              fontSize: "24px",
                            }}
                          >
                            {volunteerCalls[activeVolunteerIdx]?.call_title}
                          </h2>

                          {/* Event Details */}
                          <div className="flex flex-col gap-3 w-full">
                            {/* Date Row */}
                            <div className="flex items-center gap-3">
                              {/* Date Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="shrink-0" // Prevents icon from squishing
                              >
                                <g clipPath="url(#clip0_date)">
                                  <path
                                    d="M5.33008 1.33252V3.99739"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10.6592 1.33252V3.99739"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M12.6585 2.66504H3.33146C2.59557 2.66504 1.99902 3.26159 1.99902 3.99747V13.3245C1.99902 14.0604 2.59557 14.6569 3.33146 14.6569H12.6585C13.3944 14.6569 13.9909 14.0604 13.9909 13.3245V3.99747C13.9909 3.26159 13.3944 2.66504 12.6585 2.66504Z"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M1.99902 6.66211H13.9909"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_date">
                                    <rect
                                      width="15.9892"
                                      height="15.9892"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>

                              {/* Date Text */}
                              <span
                                className="text-sm"
                                style={{
                                  color: "#3C3333",
                                  fontFamily: '"Genty Sans", sans-serif',
                                }}
                              >
                                {(() => {
                                  const start = volunteerCalls[activeVolunteerIdx]?.call_starttime;
                                  const end = volunteerCalls[activeVolunteerIdx]?.call_endtime;
                                  if (!end) return formatDate(start);
                                  const startDate = start ? new Date(start) : null;
                                  const endDate = end ? new Date(end) : null;
                                  const sameDay = startDate && endDate &&
                                    startDate.getFullYear() === endDate.getFullYear() &&
                                    startDate.getMonth() === endDate.getMonth() &&
                                    startDate.getDate() === endDate.getDate();
                                  if (sameDay) {
                                    return formatDate(start);
                                  } else {
                                    return `${formatDate(start)} - ${formatDate(end)}`;
                                  }
                                })()}
                              </span>
                            </div>

                            {/* Time Row */}
                            <div className="flex items-center gap-3">
                              {/* Time Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="shrink-0"
                              >
                                <g clipPath="url(#clip0_time)">
                                  <path
                                    d="M7.96191 3.98096V7.96183L10.6158 9.28878"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.32696"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.96193 14.5967C11.6262 14.5967 14.5967 11.6262 14.5967 7.96193C14.5967 4.29764 11.6262 1.32715 7.96193 1.32715C4.29764 1.32715 1.32715 4.29764 1.32715 7.96193C1.32715 11.6262 4.29764 14.5967 7.96193 14.5967Z"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.32696"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_time">
                                    <rect
                                      width="15.9235"
                                      height="15.9235"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>

                              {/* Time Text */}
                              <span
                                className="text-sm"
                                style={{
                                  color: "#3C3333",
                                  fontFamily: '"Genty Sans", sans-serif',
                                }}
                              >
                                {formatTime(volunteerCalls[activeVolunteerIdx]?.call_starttime)}
                                {volunteerCalls[activeVolunteerIdx]?.call_endtime ? (
                                  <>
                                    {' - '}
                                    {formatTime(volunteerCalls[activeVolunteerIdx]?.call_endtime)}
                                  </>
                                ) : null}
                              </span>
                            </div>

                            {/* Location Row */}
                            <div className="flex items-center gap-3">
                              {/* Location Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="shrink-0"
                              >
                                <g clipPath="url(#clip0_location)">
                                  <path
                                    d="M13.3245 6.66225C13.3245 9.98868 9.63433 13.453 8.39517 14.5229C8.27973 14.6098 8.13921 14.6567 7.99477 14.6567C7.85034 14.6567 7.70982 14.6098 7.59438 14.5229C6.35521 13.453 2.66504 9.98868 2.66504 6.66225C2.66504 5.24872 3.22656 3.89308 4.22608 2.89356C5.2256 1.89404 6.58124 1.33252 7.99477 1.33252C9.40831 1.33252 10.7639 1.89404 11.7635 2.89356C12.763 3.89308 13.3245 5.24872 13.3245 6.66225Z"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.99474 8.66088C9.09857 8.66088 9.99339 7.76605 9.99339 6.66222C9.99339 5.5584 9.09857 4.66357 7.99474 4.66357C6.89092 4.66357 5.99609 5.5584 5.99609 6.66222C5.99609 7.76605 6.89092 8.66088 7.99474 8.66088Z"
                                    stroke="#8B5CA6"
                                    strokeWidth="1.33243"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_location">
                                    <rect
                                      width="15.9892"
                                      height="15.9892"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                              <span
                                className="text-sm"
                                style={{
                                  color: "#3C3333",
                                  fontFamily: '"Genty Sans", sans-serif',
                                }}>
                                {volunteerCalls[activeVolunteerIdx]?.call_location}
                              </span>
                            </div>
                          </div>

                          {/* View Button */}
                          <button
                            className="w-full text-white text-lg rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            style={{
                              backgroundColor: "#8D52A7",
                              padding: "12px 0",
                              fontFamily: '"Genty Sans", sans-serif',
                            }}
                            onClick={() => router.push(`/volunteer/${volunteerCalls[activeVolunteerIdx]?.call_id}`)}
                          >
                            View
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center w-full box-border"
                          style={{
                            height: "auto",
                            padding: "25.044px 25.044px 25.044px",
                            borderRadius: "14px",
                            border: "1.052px solid #8D52A7",
                            background: "#FFF",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)",
                            width: "100%"
                          }}
                        >
                          <PawPrint className="text-[#8D52A7] w-[32px] h-[32px] mb-2" />
                          <h2 className="mb-1 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#3C3333] break-words whitespace-normal">
                            My Volunteer Opportunities
                          </h2>
                          <div className="text-gray-500 text-center text-sm mb-3">
                            No volunteer opportunities found.
                          </div>
                          <Link
                            href="/volunteer"
                            className="mt-1 px-4 py-2 rounded-lg bg-[#8D52A7] text-white font-semibold hover:bg-[#7B4692] transition"
                          >
                            Browse Opportunities
                          </Link>
                        </div>
                      )
                    )}
                  
                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 w-full mt-2">
                  {volunteerCalls.map((_, idx) => (
                    <div
                      key={idx}
                      className={
                        idx === activeVolunteerIdx
                          ? "w-8 h-2.5 rounded-full bg-[#8D52A7]"
                          : "w-2.5 h-2.5 rounded-full bg-[#8D52A7] opacity-30"
                      }
                    ></div>
                  ))}
                </div>
              </div>

              {/* Recent Reports Section */}
              <div className="flex flex-col items-start gap-[16px] self-stretch mt-8">
                {/* Header Row (Kept exactly as requested) */}
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-[#5D4037] font-['Genty_Sans'] text-[24px] font-medium leading-[32px] w-[327px] not-italic">
                    My Recent Reports
                  </h3>

                  {/* + Button */}
                  <Link
                    href="/form"
                    style={{
                      display: "flex",
                      width: "106px",
                      height: "46px",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                      borderRadius: "16px",
                      background: "#8D52A7",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Stacked List Container */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Recent Reports List */}
                  { loading ? (
                    <div
                      className="flex items-center justify-center w-full box-border"
                      style={{
                        minHeight: "100px", // or match your card height
                        padding: "25.044px",
                        borderRadius: "14px",
                        border: "1.052px solid #5E9BBA",
                        background: "#FFF",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)",
                      }}
                    >
                      <span className="animate-pulse text-lg text-gray-500">Loading reports...</span>
                    </div>
                  ) : recentReports.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center w-full box-border"
                      style={{
                        height: "auto",
                        padding: "25.044px 25.044px 25.044px",
                        borderRadius: "14px",
                        border: "1.052px solid #5E9BBA",
                        background: "#FFF",
                        boxShadow:
                          "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)",
                      }}
                    >
                      <FileText className="text-[#5E9BBA] w-[32px] h-[32px] mb-2" />
                      <h2
                        className="text-lg mb-1"
                        style={{
                          color: "#3C3333",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        My Recent Reports
                      </h2>
                      <div className="text-gray-500 text-center text-sm mb-3">
                        No recent reports found.
                      </div>
                      <Link
                        href="/form"
                        className="mt-1 px-4 py-2 rounded-lg bg-[#5E9BBA] text-white font-semibold hover:bg-[#4A7A97] transition"
                        onClick={() => router.push('/form')}
                      >
                        File Report
                      </Link>
                    </div>
                  ) : (
                    recentReports.slice(0, 3).map((report) => (
                      <div key={report.report_id} className="flex items-start justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          {report.photo_url ? (
                            <img
                              src={report.photo_url}
                              alt="Report Thumbnail"
                              className="w-[60px] h-[60px] rounded-lg object-cover bg-gray-200"
                            />
                          ) : (
                            <div className="w-[60px] h-[60px] rounded-lg object-cover bg-gray-200 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}

                          {/* Text Details */}
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-[#3C3333] text-sm leading-tight font-['Genty_Sans']">
                              {report.report_title || "Untitled Report"}
                            </h4>
                            <span className="text-[#3C3333] text-xs font-['Genty_Sans']">
                              {report.animal_type || "Unknown"} ({report.animal_gender || "Unknown"})
                            </span>
                            <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                              {report.area || "Unknown"}{report.landmark ? ` • near ${report.landmark}` : ""}
                            </span>
                            <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                              {formatDate(report.created_at)}
                            </span>

                            {/* Status Badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit mt-1 font-['Genty_Sans'] ${getStatusColor(report.report_status)}`}>
                              {report.report_status || "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* View Button */}
                        <button
                          className="flex text-white text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 self-center"
                          style={{
                            backgroundColor: "#8D52A7",
                            padding: "8px 8px",
                            fontFamily: '"Genty Sans", sans-serif',
                          }}
                          onClick={() => handleOpenReport(report)}
                        >
                          View
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <ReportDetailsModal
                  report={selectedReport}
                  isOpen={isModalOpen}
                  onClose={handleCloseReport}
                />

                {/* Quick Actions Section */}
                <div className="flex flex-col items-start gap-[15.989px] mt-8">
                  <h3
                    style={{
                      color: "#5D4037",
                      fontFamily: '"Genty Sans", sans-serif',
                      fontSize: "24px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "32px",
                      width: "327px",
                    }}
                  >
                    Quick Actions
                  </h3>
                </div>
                <div className=" flex flex-col gap-6 md:flex-row gap-3 md:gap-4 justify-center w-full">
                  {/* Animal Profiles QA Card*/}
                  <Link
                    href="/catalog"
                    className="flex-1
      relative flex justify-between w-full
      box-border overflow-hidden
      h-[147px] p-[25px]
      items-center rounded-[14px]
      shadow-lg bg-[#DCB57E]
    "
                  >
                    {/* Content Container */}
                    <div className="flex flex-col items-start gap-1 z-10">
                      {/* Icon */}
                      <img
                        className="w-[32px] h-[32px]"
                        src="/paws/paws1.png"
                        alt="paw"
                      />
                      {/* Title */}
                      <h2
                        className="text-lg m-0 leading-tight"
                        style={{
                          color: "white",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        Animal Profiles
                      </h2>
                      {/* Subtitle */}
                      <p
                        className="text-xs m-0"
                        style={{
                          color: "#3C3333",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        View and explore animal profiles
                      </p>
                    </div>

                    {/* Decorative SVG */}
                    <div className="absolute bottom-0 right-[-10px] z-0 opacity-80 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="135"
                        height="146"
                        viewBox="0 0 135 146"
                        fill="none"
                      >
                        <path
                          d="M102.5 42.0226C102.5 30.7288 86.3353 21.767 66.6246 24.3751C37.6888 28.1938 24.4663 73.1738 25.6246 81.2501C26.4446 86.962 43.3058 95.2413 63.0986 89.3751C76.0238 85.5401 83.1886 77.5938 87.1246 69.0626"
                          stroke="#A5885F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M82 113.75V117.812"
                          stroke="#A5885F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M115.312 132.031H130.688L123 138.125L115.312 132.031Z"
                          stroke="#A5885F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M45.3051 91.3821C42.4364 100.163 40.9898 109.197 41.0001 118.268C41.0001 152.165 77.7156 170.625 123 170.625C168.285 170.625 205 152.165 205 118.268C205 109.647 203.34 100.393 199.947 91.3821M105.206 41.9659C111.067 41.0531 117.027 40.6041 123 40.6252C130.995 40.6252 138.375 41.5027 145.15 43.1115"
                          stroke="#A5885F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </Link>

                  {/* Animal Report QA Card */}
                  <Link
                    href="/form"
                    className="
      flex-1 relative flex justify-between w-full
      box-border overflow-hidden
      h-[147px] p-[25px]
      items-center rounded-[14px]
      shadow-lg bg-[#5E9BBA]
    "
                  >
                    {/* Content Container */}
                    <div className="flex flex-col items-start gap-1 z-10">
                      {/* Icon */}
                      <img
                        className="w-[32px] h-[32px] color-white"
                        src="/nav/report.png"
                        alt="report"
                      />

                      {/* Title */}
                      <h2
                        className="text-lg m-0 leading-tight"
                        style={{
                          color: "white",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        Animal Reports
                      </h2>

                      {/* Subtitle */}
                      <p
                        className="text-xs m-0"
                        style={{
                          color: "#213641",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        Report animals and view status
                      </p>
                    </div>

                    {/* Decorative SVG */}
                    <div className="absolute bottom-0 right-[-10px] z-0 opacity-80 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="124"
                        height="120"
                        viewBox="0 0 124 120"
                        fill="none"
                      >
                        <path
                          d="M108.146 12.0835H44.7497C40.7935 12.0835 36.9994 13.3566 34.202 15.6226C31.4046 17.8887 29.833 20.9621 29.833 24.1668V120.834C29.833 124.038 31.4046 127.112 34.202 129.378C36.9994 131.644 40.7935 132.917 44.7497 132.917H134.25C138.206 132.917 142 131.644 144.797 129.378C147.595 127.112 149.166 124.038 149.166 120.834V45.3127L108.146 12.0835Z"
                          stroke="#47748C"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M104.417 12.0835V48.3335H149.167"
                          stroke="#47748C"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </Link>
                  {/* Volunteer Request QA Card */}
                  <Link
                    href="/volunteer"
                    className=" flex-1
      relative flex justify-between w-full
      box-border overflow-hidden
      h-[147px] p-[25px]
      items-center rounded-[14px]
      shadow-lg bg-[#C575AD]
    "
                  >
                    {/* Content Container */}
                    <div className="flex flex-col items-start gap-1 z-10">
                      {/* Icon */}
                      <img
                        src="/nav/user.png"
                        alt="user"
                        className="w-[32px] h-[32px] color-white"
                      />

                      {/* Title */}
                      <h2
                        className="text-lg m-0 leading-tight"
                        style={{
                          color: "white",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        Volunteer Request
                      </h2>

                      {/* Subtitle */}
                      <p
                        className="text-xs m-0"
                        style={{
                          color: "#45293D",
                          fontFamily: '"Genty Sans", sans-serif',
                        }}
                      >
                        View and explore volunteer opportunities
                      </p>
                    </div>

                    {/* Decorative SVG */}
                    <div className="absolute bottom-0 right-[-10px] z-0 opacity-80 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="118"
                        height="134"
                        viewBox="0 0 118 134"
                        fill="none"
                      >
                        <path
                          d="M134.25 82.0418V44.7502C134.25 40.794 132.679 36.9999 129.881 34.2025C127.084 31.4051 123.29 29.8335 119.334 29.8335C115.378 29.8335 111.583 31.4051 108.786 34.2025C105.989 36.9999 104.417 40.794 104.417 44.7502"
                          stroke="#945882"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M104.416 74.5832V29.8332C104.416 25.877 102.845 22.0829 100.047 19.2855C97.2499 16.4881 93.4558 14.9165 89.4997 14.9165C85.5435 14.9165 81.7494 16.4881 78.952 19.2855C76.1546 22.0829 74.583 25.877 74.583 29.8332V44.7498"
                          stroke="#945882"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M74.5833 78.3127V44.7502C74.5833 40.794 73.0118 36.9999 70.2143 34.2025C67.4169 31.4051 63.6228 29.8335 59.6667 29.8335C55.7105 29.8335 51.9164 31.4051 49.119 34.2025C46.3216 36.9999 44.75 40.794 44.75 44.7502V104.417"
                          stroke="#945882"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M134.25 59.6667C134.25 55.7105 135.821 51.9164 138.619 49.119C141.416 46.3216 145.21 44.75 149.166 44.75C153.122 44.75 156.917 46.3216 159.714 49.119C162.511 51.9164 164.083 55.7105 164.083 59.6667V104.417C164.083 120.241 157.797 135.418 146.607 146.607C135.417 157.797 120.241 164.083 104.416 164.083H89.4996C68.6163 164.083 55.9371 157.669 44.8242 146.631L17.9742 119.781C15.4081 116.939 14.0331 113.219 14.1341 109.391C14.2351 105.563 15.8042 101.921 18.5166 99.2179C21.229 96.5151 24.8769 94.9589 28.7051 94.8715C32.5332 94.7841 36.2484 96.1721 39.0813 98.7483L52.208 111.875"
                          stroke="#945882"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>{" "}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
            Pawject Patrol — Youth For Animals UP Mindanao
          </p>
        </div>
      </footer>
    </main>
  );
}