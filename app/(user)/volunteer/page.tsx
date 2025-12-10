// Import necessary modules and types
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail, Calendar, Clock, MapPin, User, Search } from "lucide-react";
import {  } from "@/actions/volunteer/user";
import { supabase } from "@/utils/supabase/client";

// Define Volunteer type
type Volunteer = {
  call_id?: string;
  call_title?: string | null;
  call_details?: string | null;
  call_starttime?: string | null;
  call_endtime?: string | null;
  call_location?: string | null;
  capacity?: number | null;
  created_at?: string | null;
  call_status?: string | null;
  joined_count?: number;
};

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

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return String(value);
  }
}

function formatTime(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return String(value);
  }
}


import { joinVolunteerCall, leaveVolunteerCall, getUserResponseStatus } from '@/actions/volunteer/user';
import { listVolunteerCalls } from '@/actions/volunteer/admin';

export default function UserVolunteerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userStatuses, setUserStatuses] = useState<{ [key: string]: string | null }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null); // call_id of loading action

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      // Check authentication status
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (!mounted) return;

      if (authError || !user) {
        setIsAuthenticated(false);
        setUserName("");
        setUserEmail("");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(user.email || "");
      const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setUserName(nameFromMeta || user.email?.split("@")[0] || "");

      setLoading(true);
      const column = sortBy || 'created_at';
      const defaultAsc = column === 'call_title' || column === 'call_starttime';
      const sortOrder = defaultAsc ? 'asc' : 'desc';

      const data = await listVolunteerCalls({
        search: search || undefined,
        sortBy: column,
        sortOrder: sortOrder,
        limit: 200
      });
      setItems(data as Volunteer[]);

      // Fetch user response status for each call
      const statuses: { [key: string]: string | null } = {};
      for (const call of data as Volunteer[]) {
        if (call.call_id) {
          statuses[call.call_id] = await getUserResponseStatus(call.call_id);
        }
      }
      setUserStatuses(statuses);
      setLoading(false);
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [search, sortBy]);

  // Sidebar Component
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
              {userName ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {userName[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="font-semibold text-gray-800 text-sm"
                      style={{
                        color: "#3C3333",
                        fontFamily: "Genty Sans",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: 500,
                        lineHeight: "normal",
                      }}
                    >
                      {userName}
                    </span>
                    <span
                      className="text-xs text-gray-600"
                      style={{
                        color: "#3C3333",
                        fontSize: "12px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "normal",
                      }}
                    >
                      {userEmail}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-4">
                  <span className="text-sm font-semibold text-gray-700">
                    You are not logged in.
                  </span>
                </div>
              )}
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
                  onClick: () => router.push("/"),
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
                      if (typeof window !== "undefined") {
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
                      if (typeof window !== "undefined") {
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
                      if (typeof window !== "undefined") {
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
                      if (typeof window !== "undefined") {
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
                  onClick={() => {
                    setSidebarOpen(false);
                    item.onClick();
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
            href="/catalog"
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
              Animal Catalogue
            </span>
          </Link>

          <Link
            href="/form"
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
              Report Animal
            </span>
          </Link>

          <Link
            href="/volunteer"
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
              Task Volunteer
            </span>
          </Link>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-6">
          <a
            href="https://www.facebook.com/YFAUPMin"
            className="bg-[#C575AD] p-2 rounded-full text-white hover:opacity-80"
          >
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


  // Update URL when search or sortBy changes
  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    router.push(`/volunteer?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Join/Leave logic
  const handleJoin = async (callId: string) => {
    setActionLoading(callId);
    const res = await joinVolunteerCall(callId);
    if (res.success) {
      // Update status
      setUserStatuses((prev) => ({ ...prev, [callId]: 'Pending' }));
      // Optionally, refetch items
      setItems((prev) => prev.map((it) => it.call_id === callId ? { ...it, joined_count: (it.joined_count || 0) + 1 } : it));
    } else {
      alert(res.error || 'Failed to join');
    }
    setActionLoading(null);
  };

  const handleLeave = async (callId: string) => {
    setActionLoading(callId);
    const res = await leaveVolunteerCall(callId);
    if (res.success) {
      setUserStatuses((prev) => ({ ...prev, [callId]: null }));
      setItems((prev) => prev.map((it) => it.call_id === callId ? { ...it, joined_count: Math.max((it.joined_count || 1) - 1, 0) } : it));
    } else {
      alert(res.error || 'Failed to leave');
    }
    setActionLoading(null);
  };

  // Render the admin volunteer page
  return (
    <>
    {/* Sidebar */}
    <Sidebar />

    <main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-800" />
          </button>
          <div className="flex-1 flex justify-center items-center h-full">
            <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
          </div>
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/");
              }}
            >
              <LogIn className="w-6 h-6 text-gray-800" />
            </button>
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
            Volunteer Opportunities
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Manage upcoming volunteer opportunities
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <form className="flex-1 relative" onSubmit={handleSearchSubmit}>
            <input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, details, or location..."
              className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm"
              style={{ fontFamily: 'Genty Sans' }}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" aria-label="Search" />
            </span>
          </form>
          <div className="flex-shrink-0">
            <label className="sr-only" htmlFor="vol-sort">Sort by</label>
            <select
              id="vol-sort"
              name="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              style={{ fontFamily: 'Genty Sans' }}
            >
              <option value="">Sort By</option>
              <option value="call_title">Name</option>
              <option value="call_starttime">Start Time</option>
              <option value="created_at">Created At</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>Loading...</div>
        ) : (!items || items.length === 0) ? (
          <div className="text-center py-8" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>No volunteer requests found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items
              .filter((it) => (it.call_status || '').toLowerCase() !== 'completed')
              .map((it) => {
              const hasCapacity = typeof it.capacity === 'number' && it.capacity !== null;
              const capacity = hasCapacity ? it.capacity! : undefined;
              const joined = typeof it.joined_count === 'number' ? it.joined_count : 0;
              const spotsLeft = hasCapacity ? capacity! - joined : undefined;
              let progressPercent;
              if (hasCapacity && capacity! > 0) {
                progressPercent = Math.round((joined / capacity!) * 100);
              } else {
                // No capacity: empty if 0 volunteers, full if 1 or more
                progressPercent = joined > 0 ? 100 : 0;
              }

              // Date display logic: show only one date if start and end are the same, and only show dash if both are present and different
              const startDateStr = formatDate(it.call_starttime);
              const endDateStr = it.call_endtime ? formatDate(it.call_endtime) : '';
              const showSingleDate = it.call_endtime && startDateStr === endDateStr;
              const showDash = it.call_endtime && startDateStr !== endDateStr && startDateStr && endDateStr;

              // User status for this call
              const userStatus = it.call_id ? userStatuses[it.call_id] : null;
              const isFull = hasCapacity && joined >= capacity!;
              const canJoin = !userStatus && !isFull && it.call_status?.toLowerCase() === 'active';
              const canLeave = userStatus && (userStatus === 'Pending' || userStatus === 'Accepted');

              return (
                <div
                  key={it.call_id}
                  className="relative bg-[#F7F7E8] border-2 border-[#8D52A7] rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between min-h-[260px]"
                  style={{ fontFamily: 'Genty Sans', padding: '0' }}
                >
                  {/* Status badge */}
                  <div className="absolute top-6 left-5">
                    <span
                      className={`px-7 py-3 rounded-xl text-xs font-semibold border-2 shadow-md`}
                      style={{
                        fontFamily: '"Genty Sans", sans-serif',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        ...statusBadgeClasses(it.call_status),
                      }}
                    >
                      {it.call_status || 'Active'}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="p-6 pt-12 flex-1 flex flex-col justify-between border-[#8D52A7]">
                    <div>
                      <h3 className="text-lg font-bold mt-8 mb-5" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>
                        {it.call_title}
                      </h3>
                      <div className="flex flex-col gap-2 text-xs" style={{ color: '#3C3333' }}>
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4 mr-1" /><span> {it.call_location || '—'}</span></div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4 mr-1" /><span> {showSingleDate ? startDateStr : <>{startDateStr}{showDash ? <> - {endDateStr}</> : endDateStr ? <> {endDateStr}</> : null}</>}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4 mr-1" /><span> {formatTime(it.call_starttime)}{it.call_endtime ? ` - ${formatTime(it.call_endtime)}` : ''}</span></div>
                        {/* Volunteer Capacity label and progress bar */}
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4 mr-1" />
                          Volunteer Capacity
                        </span>
                        <span>
                          <div className="w-full h-2 bg-[#E1E69D] rounded-full overflow-hidden" style={{ background: '#E5E7EB'}}>
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${progressPercent}%`, background: '#689668', transition: 'width 0.3s' }}
                            />
                          </div>
                        </span>
                        <span className="flex items-center justify-between">
                          {hasCapacity ? (
                            <>
                              <span className="text-xs text-gray-600">{joined}/{capacity} {joined === 1 ? 'volunteer' : 'volunteers'}</span>
                              <span
                                className={`text-xs ${spotsLeft === 0 ? 'text-red-500' : 'text-green-600'}`}
                              >
                                {spotsLeft} spots left
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-600">{joined} {joined === 1 ? 'volunteer' : 'volunteers'}</span>
                          )}
                        </span>
                        </div>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex gap-4 px-6 pb-6">
                    <Link
                      href={`/volunteer/${it.call_id}`}
                      className="flex-1 px-7 py-3 rounded-xl text-xs font-semibold border-2 border-[#8D52A7] text-white bg-[#8D52A7] text-center transition-all hover:bg-[#6C3483]"
                      style={{ fontFamily: 'Genty Sans', display: 'block', textDecoration: 'none' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
    </>
  );
}