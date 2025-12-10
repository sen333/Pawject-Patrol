"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  LogIn,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Users,
  FileText,
  Home,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  getVolunteerCall,
  deleteAction,
  cancelAction,
  uncancelAction,
  completeAction,
  getVolunteerResponses,
  uncompleteAction,
} from "@/actions/volunteer/admin";

// Volunteer type
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
// Function to determine badge classes based on status
function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) {
    return { background: "#E1E69D", color: "#3C3333", borderColor: "#C2C876" };
  }
  if (s.includes("filled")) {
    return { background: "#C2C876", color: "#3C3333", borderColor: "#A3B18A" };
  }
  if (s.includes("ongoing")) {
    return { background: "#D1C4E9", color: "#6C3483", borderColor: "#B39DDB" };
  }
  if (s.includes("cancel")) {
    return { background: "#F8B4B4", color: "#B71C1C", borderColor: "#F44336" };
  }
  if (s.includes("completed")) {
    return { background: "#E0E0E0", color: "#616161", borderColor: "#BDBDBD" };
  }
  return { background: "#FFE082", color: "#3C3333", borderColor: "#FFD54F" };
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  // Format: Dec. 16, 2025, 09:00 AM
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  let hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const hourStr = hour.toString().padStart(2, "0");
  return `${month} ${day}, ${year}, ${hourStr}:${minute} ${ampm}`;
}

// Main component for Admin Volunteer Detail Page
export default function AdminVolunteerDetailPage(props: any) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [volunteer, setVolunteer] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get volunteer ID from params
  useEffect(() => {
    (async () => {
      const resolvedParams: any = await props.params;
      const id = resolvedParams?.id;
      if (!id) return;
      const v = await getVolunteerCall(id);
      setVolunteer(v);
      setResponses(await getVolunteerResponses(id));
      setLoading(false);
    })();
  }, [props.params]);

  // Fetch user info
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || "");
      const nameFromMeta = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
      setUserName(nameFromMeta || user?.email?.split("@")[0] || "");
    })();
  }, []);

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const Sidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-[375px] bg-[#E1E69D] z-40 transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
        style={{
          display: "flex",
          padding: "24px",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
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
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                alignSelf: "stretch",
                borderRadius: "16px",
                border: "1px solid #3C3333",
                backgroundColor: "#E6E6E6",
                padding: "12px",
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userName ? userName[0].toUpperCase() : "?"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm" style={{ color: "#3C3333", fontFamily: "Genty Sans", fontSize: "16px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>{userName || "Admin"}</span>
                  <span className="text-xs text-gray-600" style={{ color: "#3C3333", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal" }}>{userEmail || "admin@pawjectpatrol.com"}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className="w-full"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                alignSelf: "stretch",
                borderRadius: "16px",
                border: "1px solid #3C3333",
                backgroundColor: "#E6E6E6",
                padding: "12px",
              }}
            >
              {[
                {
                  label: "Home",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                        stroke="#3C3333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 22V12H15V22"
                        stroke="#3C3333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  label: "About Us",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z"
                        stroke="#8D52A7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                  onClick: () => {
                    setSidebarOpen(false);
                    router.push("/about-us");
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        const scrollToSection = () => {
                          const el = document.getElementById("about-us");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        };
                        setTimeout(scrollToSection, 400);
                      }
                    }, 400);
                  },
                },
                {
                  label: "Mission",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <g clipPath="url(#clip0)">
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="#C575AD"
                          strokeWidth="3"
                        />
                        <path
                          d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                          stroke="#C575AD"
                          strokeWidth="3"
                        />
                        <path
                          d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                          stroke="#C575AD"
                          strokeWidth="3"
                        />
                      </g>
                    </svg>
                  ),
                  onClick: () => {
                    setSidebarOpen(false);
                    router.push("/about-us");
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        const scrollToSection = () => {
                          const el = document.getElementById("mission");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        };
                        setTimeout(scrollToSection, 400);
                      }
                    }, 400);
                  },
                },
                {
                  label: "Vision",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                        stroke="#5E9BBA"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="#5E9BBA"
                        strokeWidth="2"
                      />
                    </svg>
                  ),
                  onClick: () => {
                    setSidebarOpen(false);
                    router.push("/about-us");
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        const scrollToSection = () => {
                          const el = document.getElementById("vision");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        };
                        setTimeout(scrollToSection, 400);
                      }
                    }, 400);
                  },
                },
                {
                  label: "Goals",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986"
                        stroke="#689668"
                        strokeWidth="2"
                      />
                      <path
                        d="M22 4L12 14.01L9 11.01"
                        stroke="#689668"
                        strokeWidth="2"
                      />
                    </svg>
                  ),
                  onClick: () => {
                    setSidebarOpen(false);
                    router.push("/about-us");
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        const scrollToSection = () => {
                          const el = document.getElementById("goals");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        };
                        setTimeout(scrollToSection, 400);
                      }
                    }, 400);
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick ? item.onClick : () => {
                    setSidebarOpen(false);
                    router.push("/admin");
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
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "5px",
            alignSelf: "stretch",
            borderRadius: "16px",
            border: "1px solid #000",
            backgroundColor: "#E6E6E6",
            padding: "12px",
            marginTop: "24px",
          }}
        >
          <Link
            href="/admin/profiles"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
              >
                <path
                  d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z"
                  stroke="#3C3333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="#3C3333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              Animal Profiles
            </span>
          </Link>

          <Link
            href="/admin/report"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
              >
                <path
                  d="M20.42 4.58C19.92 4.08 19.32 3.68 18.67 3.4C18.01 3.13 17.31 2.99 16.6 2.99C15.89 2.99 15.18 3.13 14.52 3.4C13.87 3.68 13.27 4.08 12.77 4.58L12 5.36L11.23 4.58C10.73 4.08 10.13 3.68 9.48 3.4C8.82 3.13 8.12 2.99 7.41 2.99C6.7 2.99 5.99 3.13 5.33 3.4C4.68 3.68 4.08 4.08 3.58 4.58C1.46 6.7 1.33 10.28 4 13L12 21L20 13C22.67 10.28 22.54 6.7 20.42 4.58Z"
                  stroke="#8D52A7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              Animal Reports
            </span>
          </Link>

          <Link
            href="/admin/volunteer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
              >
                <g clipPath="url(#clip0)">
                  <path
                    d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z"
                    stroke="#C575AD"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18Z"
                    stroke="#C575AD"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14Z"
                    stroke="#C575AD"
                    strokeWidth="3"
                  />
                </g>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              Volunteer Requests
            </span>
          </Link>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-6">
          <a href="https://www.facebook.com/YFAUPMin" className="bg-[#C575AD] p-2 rounded-full text-white hover:opacity-80">
            <Facebook size={18} />
          </a>
          <a
            href="#"
            className="bg-[#8D52A7] p-2 rounded-full text-white hover:opacity-80"
          >
            <Instagram size={18} />
          </a>
          <a
            href="#"
            className="bg-[#5E9BBA] p-2 rounded-full text-white hover:opacity-80"
          >
            <Twitter size={18} />
          </a>
          <a
            href="mailto:yfaupmindanao@gmail.com"
            className="bg-[#9BBF94] p-2 rounded-full text-white hover:opacity-80"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </>
  );

  // Render the volunteer detail page with sidebar
  return (
    <>
      {sidebarOpen && <Sidebar />}
      <div className="min-h-screen bg-[#E6E6E6] w-full flex flex-col overflow-x-hidden">
        {/* Header with menu, logo, and logout button */}
        <header className="flex items-center justify-between px-2 sm:px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto sticky top-0 z-20">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-800" />
            </button>

            <div className="flex-1 flex justify-center items-center h-full min-w-0">
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
        {/* Main Content */}
        <main className="flex-1 w-full flex flex-col">
          {loading ? (
            <div className="py-24 text-center" style={{ color: '#3C3333', fontFamily: 'Genty Sans, sans-serif' }}>Loading...</div>
          ) : !volunteer ? (
            <div className="py-24 text-center" style={{ color: '#3C3333', fontFamily: 'Genty Sans, sans-serif' }}>Volunteer request not found.</div>
          ) : (
            <>
              <div className="py-4 sm:py-6 md:py-8" style={{ backgroundColor: '#E6E6E6' }}>
                <div className="max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto px-2 sm:px-4 md:px-6 w-full">
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
              <div className="max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto px-2 sm:px-4 md:px-6 pb-8 w-full">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full" style={{ border: '3px solid #8D52A7', borderRadius: '1rem' }}>
                  <div className="relative min-h-[112px] flex flex-col sm:flex-row items-center justify-center px-2 sm:px-6 gap-4"
                    style={{
                      backgroundColor: 'transparent',
                      borderBottom: '3px solid #8D52A7',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderRadius: '1rem 1rem 0 0'
                    }}>
                    <div className="flex flex-row items-center gap-4 justify-start w-full h-full" style={{alignItems: 'center'}}>
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-base sm:text-xl" style={{ backgroundColor: '#8D52A7', color: 'white', fontFamily: 'Genty Sans, sans-serif' }}>
                        {(volunteer.call_title && volunteer.call_title[0]) ? volunteer.call_title[0].toUpperCase() : 'V'}
                      </div>
                      <div className="flex flex-col items-start justify-center">
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight" style={{ color: '#3C3333', fontFamily: 'Genty Sans, sans-serif' }}>
                          {volunteer.call_title || "Untitled"}
                        </h2>
                        <div
                          className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            ...statusBadgeClasses(volunteer.call_status),
                            fontFamily: 'Genty Sans, sans-serif',
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                          }}
                        >
                          {volunteer.call_status || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4 md:p-6">
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ color: '#3C3333', fontSize: '18px', fontWeight: 500, fontFamily: 'Genty Sans, sans-serif', marginBottom: '0.6rem' }}>
                        Description
                      </div>
                      {volunteer.call_details && (
                        <div style={{ color: '#364153', fontSize: '16px', fontWeight: 400, fontFamily: 'Arial, sans-serif', marginBottom: '1rem', marginTop: 0 }}>
                          {volunteer.call_details}
                        </div>
                      )}
                    </div>
                    {/* Responsive Info Rows */}
                    <div className="flex flex-col gap-4 md:gap-6 mb-2">
                      {/* Row 1: Start Time & Location */}
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-10">
                        {/* Start Time */}
                        <div className="flex items-start gap-2 flex-1">
                          <span className="mt-[2px] text-gray-400">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B7280" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6B7280" strokeWidth="2"/></svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#4A5565] mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Start Time</span>
                            <span className="text-[16px] text-[#3C3333]" style={{ fontFamily: 'Arial, sans-serif' }}>{formatDateTime(volunteer.call_starttime)}</span>
                          </div>
                        </div>
                        {/* Location */}
                        <div className="flex items-start gap-2 flex-1 mt-4 sm:mt-0">
                          <span className="mt-[2px] text-gray-400">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 0 1 16 0c0 4.97-3.582 9-8 9Z" stroke="#6B7280" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2"/></svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#4A5565] mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Location</span>
                            <span className="text-[16px] text-[#3C3333]" style={{ fontFamily: 'Arial, sans-serif' }}>{volunteer.call_location || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      {/* Row 2: End Time & Created At */}
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-10">
                        {/* End Time */}
                        <div className="flex items-start gap-2 flex-1">
                          <span className="mt-[2px] text-gray-400">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B7280" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6B7280" strokeWidth="2"/></svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#4A5565] mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>End Time</span>
                            <span className="text-[16px] text-[#3C3333]" style={{ fontFamily: 'Arial, sans-serif' }}>{formatDateTime(volunteer.call_endtime)}</span>
                          </div>
                        </div>
                        {/* Created At */}
                        <div className="flex items-start gap-2 flex-1 mt-4 sm:mt-0">
                          <span className="mt-[2px] text-gray-400">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#6B7280" strokeWidth="2"/><path d="M8 2v4M16 2v4M4 10h16" stroke="#6B7280" strokeWidth="2"/></svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#4A5565] mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Created At</span>
                            <span className="text-[16px] text-[#3C3333]" style={{ fontFamily: 'Arial, sans-serif' }}>{volunteer.created_at ? formatDateTime(volunteer.created_at) : '—'}</span>
                          </div>
                        </div>
                      </div>
                      {/* Volunteer Capacity (formatted like other details) */}
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-10 mt-2 mb-2">
                        {/* Volunteer Capacity */}
                        <div className="flex items-start gap-2 flex-1">
                          <span className="mt-[2px] text-gray-400">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z" stroke="#6B7280" strokeWidth="2"/></svg>
                          </span>
                          <div className="flex flex-col w-full">
                            <span className="text-[14px] font-bold text-[#4A5565] mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Volunteer Capacity</span>
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-3 bg-gray-100 rounded-lg overflow-hidden">
                                <div style={{
                                  width: `${typeof volunteer.capacity === 'number' && volunteer.capacity > 0
                                    ? Math.min(100, Math.round((responses.length / volunteer.capacity) * 100))
                                    : 0}%`,
                                  height: '100%',
                                  background: '#689668',
                                  borderRadius: '6px',
                                  transition: 'width 0.3s'
                                }} />
                              </div>
                              <div className="text-[16px] text-[#101828]" style={{ fontFamily: 'Arial, sans-serif' }}>
                                {typeof volunteer.capacity === 'number' ? `${responses.length}/${volunteer.capacity} volunteers` : `${responses.length} volunteers`}
                                {typeof volunteer.capacity === 'number' && (
                                  <span style={{ color: (volunteer.capacity - responses.length) === 0 ? '#DC2626' : '#10B981', fontWeight: 500, marginLeft: '0.5rem' }}>
                                    ({Math.max(0, volunteer.capacity - responses.length)} spots remaining)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Volunteers Section */}
                    <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6 w-full">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#3C3333', fontFamily: 'Genty Sans, sans-serif' }}>
                        {responses.length === 1 ? 'Volunteer Joined' : 'Volunteers Joined'}
                      </h3>
                      {responses.length > 0 ? (
                        <div className="space-y-2 w-full">
                          {responses.map((response: any) => {
                            const userName = response.user?.name || response.user?.email || 'Unknown User';
                            const firstLetter = userName[0]?.toUpperCase() || 'U';
                            return (
                              <div 
                                key={response.response_id} 
                                className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-3 rounded-lg border w-full"
                                style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                  {/* Profile Picture */}
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#8D52A7' }}
                                  >
                                    <span className="text-sm font-bold text-white">{firstLetter}</span>
                                  </div>
                                  {/* User Info */}
                                  <div>
                                    <div className="font-medium" style={{ color: '#3C3333', fontFamily: 'Genty Sans, sans-serif' }}>
                                      {userName}
                                    </div>
                                    {response.user?.email && response.user.email !== userName && (
                                      <div className="text-xs mt-0.5" style={{ color: '#6B7280', fontFamily: 'Genty Sans, sans-serif' }}>
                                        {response.user.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs mt-2 sm:mt-0" style={{ color: '#9CA3AF', fontFamily: 'Genty Sans, sans-serif' }}>
                                  {formatDateTime(response.created_at)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm font-bold" style={{ color: '#6B7280', fontFamily: 'Arial, sans-serif' }}>
                          No volunteers have joined yet.
                        </div>
                      )}
                    </div>
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      {/* Make all buttons stretch evenly and have the same size */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <div className="flex-1 min-w-0 flex">
                          <Link 
                            href="/admin/volunteer" 
                            className="px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F3F4F6] transition-colors w-full"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#6B4A6B',
                              fontFamily: 'Genty Sans, sans-serif',
                              flex: 1,
                              textAlign: 'center',
                              border: '1.5px solid #6B4A6B',
                              fontWeight: 500,
                              boxSizing: 'border-box',
                              minWidth: 0,
                            }}
                          >
                            Back
                          </Link>
                        </div>
                        {volunteer.call_status?.toLowerCase() !== 'cancelled' && volunteer.call_status?.toLowerCase() !== 'completed' && (
                          <div className="flex-1 min-w-0 flex">
                            <Link 
                              href={`/admin/volunteer/${volunteer.call_id}/edit`} 
                              className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3F4F6] transition-colors w-full"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#6B4A6B',
                                fontFamily: 'Genty Sans, sans-serif',
                                flex: 1,
                                textAlign: 'center',
                                border: '1.5px solid #6B4A6B',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              Edit Request
                            </Link>
                          </div>
                        )}
                        {volunteer.call_status?.toLowerCase() !== 'completed' && volunteer.call_status?.toLowerCase() !== 'cancelled' && (
                          <form action={completeAction} className="flex-1 min-w-0 flex">
                            <input type="hidden" name="id" value={volunteer.call_id} />
                            <button 
                              type="submit" 
                              className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3F4F6] transition-colors w-full"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#6B4A6B',
                                fontFamily: 'Genty Sans, sans-serif',
                                flex: 1,
                                textAlign: 'center',
                                border: '1.5px solid #6B4A6B',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              Complete Request
                            </button>
                          </form>
                        )}
                        {volunteer.call_status?.toLowerCase() === 'completed' && (
                          <form action={uncompleteAction} className="flex-1 min-w-0 flex">
                            <input type="hidden" name="id" value={volunteer.call_id} />
                            <button 
                              type="submit" 
                              className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3F4F6] transition-colors w-full"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#6B4A6B',
                                fontFamily: 'Genty Sans, sans-serif',
                                flex: 1,
                                textAlign: 'center',
                                border: '1.5px solid #6B4A6B',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              Uncomplete Request
                            </button>
                          </form>
                        )}
                        {volunteer.call_status?.toLowerCase() === 'cancelled' ? (
                          <form action={uncancelAction} className="flex-1 min-w-0 flex">
                            <input type="hidden" name="id" value={volunteer.call_id} />
                            <button 
                              type="submit" 
                              className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3F4F6] transition-colors w-full"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#6B4A6B',
                                fontFamily: 'Genty Sans, sans-serif',
                                flex: 1,
                                textAlign: 'center',
                                border: '1.5px solid #6B4A6B',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              Uncancel Request
                            </button>
                          </form>
                        ) : volunteer.call_status?.toLowerCase() !== 'completed' && (
                          <form action={cancelAction} className="flex-1 min-w-0 flex">
                            <input type="hidden" name="id" value={volunteer.call_id} />
                            <button 
                              type="submit" 
                              className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3F4F6] transition-colors w-full"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#6B4A6B',
                                fontFamily: 'Genty Sans, sans-serif',
                                flex: 1,
                                textAlign: 'center',
                                border: '1.5px solid #6B4A6B',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              Cancel Request
                            </button>
                          </form>
                        )}
                        <form action={deleteAction} className="flex-1 min-w-0 flex">
                          <input type="hidden" name="id" value={volunteer.call_id} />
                          <button 
                            type="submit" 
                            className="px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity w-full"
                            style={{
                              backgroundColor: '#6B4A6B',
                              color: 'white',
                              fontFamily: 'Genty Sans, sans-serif',
                              flex: 1,
                              textAlign: 'center',
                              border: '1.5px solid #6B4A6B',
                              fontWeight: 500,
                              boxSizing: 'border-box',
                              minWidth: 0,
                            }}
                          >
                            Delete Request
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
