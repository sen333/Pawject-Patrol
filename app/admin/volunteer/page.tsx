// Import necessary modules and types
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail, } from "lucide-react";
import { listVolunteerCalls, deleteAction } from "@/actions/volunteer/admin";
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
};

// Function to determine badge classes based on status
function statusBadgeClasses(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("filled")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("ongoing")) return "bg-purple-100 text-purple-800 border-purple-200";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  if (s.includes("completed")) return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

// Function to format date and time for display
function formatDateTime(value?: string | null) {
  // Handle empty values
  if (!value) return "";

  // Attempt to format the date
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    // Fallback to returning the original value
    return String(value);
  }
}

// Main component for Admin Volunteer Page
export default function AdminVolunteerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for user info
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch volunteer calls when search or sortBy changes
  useEffect(() => {
    let mounted = true;

    const checkAdminAndFetchData = async () => {
      // Check authentication status
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      // Early return if component unmounted during async operation
      if (!mounted) return;


      if (authError || !user) {
        setIsAuthenticated(false);
        setUserName("");
        setUserEmail("");
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(user.email || "");
      // Try to get name from user metadata, fallback to email username
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
      setLoading(false);
    };

     // Execute authentication check and data fetch on mount
    checkAdminAndFetchData();

    // Cleanup function to prevent state updates after unmount
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
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userName ? userName[0].toUpperCase() : "?"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm" style={{ color: "#3C3333", fontFamily: "Genty Sans", fontSize: "16px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>
                    {isAuthenticated ? (userName || "Admin") : "You are not logged in"}
                  </span>
                  <span className="text-xs text-gray-600" style={{ color: "#3C3333", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal" }}>
                    {isAuthenticated ? (userEmail || "admin@pawjectpatrol.com") : ""}
                  </span>
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
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push("/admin"); // Redirect to landing page
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
          <a href="#" className="bg-[#C575AD] p-2 rounded-full text-white hover:opacity-80">
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
            href="#"
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
    router.push(`/admin/volunteer?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Render the admin volunteer page
  return (
    <>
      {/* Floating Add Volunteer Request Button */}
      <Link
        href="/admin/volunteer/request"
        aria-label="Add Volunteer Request"
        className="fixed bottom-4 right-6 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-[#E1E69D] text-[#3C3333] hover:text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-[#C2C876] transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 animate-pulse">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      {/* Sidebar */
      <Sidebar />}

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
            Volunteer Requests
          </h2>
          <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
            Manage upcoming volunteer opportunities
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <form className="flex-1" onSubmit={handleSearchSubmit}>
            <input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, details, or location..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm"
              style={{ fontFamily: 'Genty Sans' }}
            />
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
        ) : null}

        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => (
            <div key={it.call_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#3C3333', fontFamily: 'Genty Sans' }}>{it.call_title}</h3>
                    <p className="text-sm mt-1" style={{ color: '#6B7280', fontFamily: 'Genty Sans' }}>{it.call_details || '—'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(it.call_status)}`} style={{ fontFamily: 'Genty Sans' }}>
                    {it.call_status || 'Pending'}
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: '#6B7280', fontFamily: 'Genty Sans' }}>
                  <div>{formatDateTime(it.call_starttime)}{it.call_endtime ? ` - ${formatDateTime(it.call_endtime)}` : ''}</div>
                  <div className="mt-2">{it.call_location || ''}{it.capacity ? ` - Capacity: ${it.capacity}` : ''}</div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <Link 
                    href={`/admin/volunteer/${it.call_id}`} 
                    className="px-3 py-1 rounded text-xs font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: 'Genty Sans' }}
                  >
                    View
                  </Link>
                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="id" value={it.call_id} />
                    <button 
                      type="submit" 
                      className="text-xs px-3 py-1 rounded font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: 'Genty Sans' }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
    </>
  );
}