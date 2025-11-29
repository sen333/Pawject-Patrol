"use client";

import { useEffect, useState } from "react";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

// Admin dashboard page component - displays stats and navigation cards
export default function HeaderAndBackground() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State management for paw decorations, dog image, and dashboard stats
  const [paws, setPaws] = useState<
    { src: string; top: string; left: string; rotate: number }[]
  >([]);
  const [dogSrc, setDogSrc] = useState("/dog.png");
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [animalReports, setAnimalReports] = useState(0);
  const [volunteerRequests, setVolunteerRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  // Recent items (for dashboard previews)
  const [recentAnimals, setRecentAnimals] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<any[]>([]);

  // State for user info
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Handle responsive layout changes for paw decorations and dog image
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width > 768) {
        // Desktop/Tablet Layout — 12 paws positioned across the screen
        setPaws([
          { src: "/paws/paws1.png", top: "8%", left: "10%", rotate: 43 },
          { src: "/paws/paws2.png", top: "15%", left: "30%", rotate: -15 },
          { src: "/paws/paws1.png", top: "18%", left: "70%", rotate: 20 },
          { src: "/paws/paws2.png", top: "30%", left: "85%", rotate: -25 },
          { src: "/paws/paws1.png", top: "38%", left: "55%", rotate: 10 },
          { src: "/paws/paws2.png", top: "45%", left: "15%", rotate: -35 },
          { src: "/paws/paws1.png", top: "55%", left: "75%", rotate: 30 },
          { src: "/paws/paws2.png", top: "60%", left: "40%", rotate: -10 },
          { src: "/paws/paws1.png", top: "70%", left: "10%", rotate: 25 },
          { src: "/paws/paws2.png", top: "75%", left: "85%", rotate: -20 },
          { src: "/paws/paws1.png", top: "82%", left: "50%", rotate: 15 },
          { src: "/paws/paws2.png", top: "88%", left: "25%", rotate: -30 },
        ]);
        // Use larger dog image for desktop
        setDogSrc("/dog2.png");
      } else {
        // Mobile Layout — 10 paws optimized for smaller screens
        setPaws([
          { src: "/paws/paws1.png", top: "8%", left: "10%", rotate: 40 },
          { src: "/paws/paws2.png", top: "15%", left: "65%", rotate: -30 },
          { src: "/paws/paws1.png", top: "25%", left: "35%", rotate: 25 },
          { src: "/paws/paws2.png", top: "35%", left: "80%", rotate: -10 },
          { src: "/paws/paws1.png", top: "50%", left: "20%", rotate: 15 },
          { src: "/paws/paws2.png", top: "55%", left: "60%", rotate: -20 },
          { src: "/paws/paws1.png", top: "65%", left: "10%", rotate: 35 },
          { src: "/paws/paws2.png", top: "70%", left: "80%", rotate: -40 },
          { src: "/paws/paws1.png", top: "85%", left: "30%", rotate: 10 },
          { src: "/paws/paws2.png", top: "90%", left: "70%", rotate: -35 },
        ]);
        // Use smaller dog image for mobile
        setDogSrc("/dog.png");
      }
    };

    // Initialize layout and add resize listener
    handleResize();
    window.addEventListener("resize", handleResize);
    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verify admin authentication and fetch dashboard statistics
  useEffect(() => {
    let mounted = true;

    const checkAdminAndFetchData = async () => {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      // Early return if component unmounted during async operation
      if (!mounted) return;

      if (authError || !user) {
        router.replace("/admin/login");
        return;
      }

      // Set user info from Supabase user object
      setUserEmail(user.email || "");
      // Try to get name from user metadata, fallback to email username
      const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setUserName(nameFromMeta || user.email?.split("@")[0] || "");

      // Verify user has admin privileges
      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("auth_id")
        .eq("auth_id", user.id)
        .single();

      if (!mounted) return;

      // Fetch dashboard statistics from database tables
      const { count: animalsCount } = await supabase
        .from("animal")
        .select("*", { count: "exact", head: true });

      const { count: reportsCount } = await supabase
        .from("animal_report")
        .select("*", { count: "exact", head: true });

      const { count: callCount } = await supabase
        .from("volunteer_call")
        .select("*", { count: "exact", head: true });

      // Fetch recent entries for quick preview (latest 3)
      const { data: recentAnimalsData } = await supabase
        .from("animal")
        .select("animal_id, animal_name, animal_breed, animal_photo, animal_status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: recentReportsData } = await supabase
        .from("animal_report")
        .select("report_id, animal_name, animal_description, photo_url, report_status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: recentVolunteersData } = await supabase
        .from("volunteer_call")
        .select("id, title, summary, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      // Update state with fetched counts and recent items if component still mounted
      if (mounted) {
        setTotalAnimals(animalsCount || 0);
        setAnimalReports(reportsCount || 0);
        setVolunteerRequests(callCount || 0);
        setRecentAnimals(recentAnimalsData || []);
        setRecentReports(recentReportsData || []);
        setRecentVolunteers(recentVolunteersData || []);
        setLoading(false);
      }
    };

    // Execute authentication check and data fetch on mount
    checkAdminAndFetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, [router]);

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };
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
                { label: "Home", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: "About Us", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: "Mission", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0)">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                    </g>
                  </svg>
                )},
                { label: "Vision", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
                  </svg>
                )},
                { label: "Goals", icon: (
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
                  router.push("/"); // Redirect to landing page
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

          <button
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
          </button>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-auto">
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

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#E1E69D]">
        {/* Sidebar */}
      <Sidebar />
      {/* --- Paw Background Decorations --- */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {paws.map((paw, index) => (
          <Image
            key={index}
            src={paw.src}
            alt="paw"
            width={44}
            height={44}
            className="absolute"
            style={{
              top: paw.top,
              left: paw.left,
              transform: `rotate(${paw.rotate}deg)`,
              aspectRatio: "43.96 / 43.96",
              flexShrink: 0,
              objectFit: "cover",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Header with menu, logo, and logout button */}
        <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
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

           <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <LogIn className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="flex-1 w-full flex flex-col items-center lg:justify-center">
          {/* --- Dashboard Statistics --- */}
          <section className="w-full max-w-lg md:max-w-2xl lg:max-w-[1400px] mx-auto px-6 mt-8">
            <div
              className="flex flex-col gap-4"
              style={{ fontFamily: '"Genty Sans", sans-serif' }}
            >
              {/* Total Animals */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#DCB57E]">
                  {loading ? "..." : totalAnimals}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Total Animals
                </span>
              </div>

              {/* Animal Reports */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#5E9BBA]">
                  {loading ? "..." : animalReports}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Animal Reports
                </span>
              </div>

              {/* Volunteer Requests */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#8D52A7]">
                  {loading ? "..." : volunteerRequests}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Volunteer Requests
                </span>
              </div>
            </div>
          </section>

          {/* --- Decorative Dog Image --- */}
          <div className="w-full max-w-[1300px] mx-auto px-6 flex justify-end">
            <div
              className="relative w-[400px] h-[400px] -mt-72 mr-0 ml-2 
                               md:w-[500px] md:h-[440px] md:-mt-84 md:mr-4 
                               lg:w-[800px] lg:h-[700px] lg:-mt-[34rem] lg:mr-6"
            >
              <Image
                src={dogSrc}
                alt="Golden Retriever puppy"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>

          {/* --- Admin Navigation Cards --- */}
          <section className="w-full max-w-[1400px] mx-auto px-6 -mt-23 md:-mt-12 lg:-mt-24 pb-12">
            <div className="flex flex-col gap-5 lg:gap-6 self-stretch rounded-2xl bg-[#E6E6E6] py-5 px-5 lg:py-8 lg:px-8 shadow-[0_4px_6px_0_rgba(0,0,0,0.09)]">
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
                
                {/* Card 1: Animal Profiles - View and manage animal database */}

                <div role="button" tabIndex={0} onKeyDown={(e) => { if ((e as any).key === 'Enter') router.push('/admin/profiles'); }} onClick={() => router.push('/admin/profiles')} className="flex w-full lg:flex-1 min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#C575AD] bg-[#fcfcfc]">
                  <div className="flex-1 px-4 py-5 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2
                            className="text-md lg:text-xl font-medium mb-0.5"
                            style={{
                              color: "#C575AD",
                              fontFamily: '"Genty Sans", sans-serif',
                            }}
                          >
                            Animal Profiles
                          </h2>
                          <p
                            className="text-[10px] md:text-xs lg:text-base text-gray-600"
                            style={{ fontFamily: '"Genty Sans", sans-serif' }}
                          >
                            {loading ? "..." : `${totalAnimals} total animals`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 flex flex-col gap-3">
                        {recentAnimals.length === 0 ? (
                          <div className="text-sm text-gray-500">No recent animals</div>
                        ) : (
                          recentAnimals.map((it) => (
                            <div key={it.animal_id || it.created_at} className="flex items-center gap-3 bg-white rounded-md p-3 shadow-sm">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {it.animal_photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={it.animal_photo} alt={it.animal_name} className="w-full h-full object-cover"/>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No photo</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-800">{it.animal_name || 'Unnamed'}</div>
                                <div className="text-xs text-gray-500">{it.animal_breed || it.animal_species || 'Unknown'}</div>
                              </div>
                              <div className="text-xs text-green-500 font-semibold">{it.animal_status || ''}</div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-4">
                        <Link href="/admin/profiles" className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-md shadow">View All Animals →</Link>
                      </div>
                    </div>
                    <div className="w-24 lg:w-32 flex items-center justify-center bg-[#C575AD]">
                      <img
                        src="/paws/paws1.png"
                        alt="Animal Profiles"
                        className="w-10 h-10 lg:w-12 lg-h-12"
                      />
                    </div>
                </div>

                {/* Card 2: Volunteer Requests - Manage volunteer tasks and requests */}
                <div role="button" tabIndex={0} onKeyDown={(e) => { if ((e as any).key === 'Enter') router.push('/admin/volunteers'); }} onClick={() => router.push('/admin/volunteers')} className="flex w-full lg:flex-1 min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#5E9BBA] bg-[#fcfcfc]">
                  <div className="flex-1 px-4 py-5 flex flex-col">
                    <div>
                      <h2 className="text-md lg:text-xl font-medium mb-0.5" style={{ color: "#5E9BBA", fontFamily: '"Genty Sans", sans-serif' }}>Volunteer Requests</h2>
                      <p className="text-[10px] md:text-xs lg:text-base text-gray-600" style={{ fontFamily: '"Genty Sans", sans-serif' }}>{loading ? '...' : `${volunteerRequests} total requests`}</p>
                    </div>

                    <div className="mt-3 flex-1 flex flex-col gap-3">
                      {recentVolunteers.length === 0 ? (
                        <div className="text-sm text-gray-500">No recent requests</div>
                      ) : (
                        recentVolunteers.map((it) => (
                          <div key={it.id || it.created_at} className="flex items-center gap-3 bg-white rounded-md p-3 shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">V</div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-800">{it.title || 'Volunteer Request'}</div>
                              <div className="text-xs text-gray-500">{it.summary || ''}</div>
                            </div>
                            <div className="text-xs text-blue-500 font-semibold">{/* placeholder */}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4">
                      <Link href="/admin/volunteers" className="block w-full text-center bg-gradient-to-r from-blue-400 to-teal-500 text-white px-4 py-2 rounded-md shadow">View All Requests →</Link>
                    </div>
                  </div>
                  <div className="w-24 lg:w-32 flex items-center justify-center bg-[#5E9BBA]">
                    <img
                      src="/nav/user.png"
                      alt="Volunteer Requests"
                      className="w-10 h-10 lg:w-12 lg-h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Animal Reports - Track stray findings and reports */}
              <div role="button" tabIndex={0} onKeyDown={(e) => { if ((e as any).key === 'Enter') router.push('/admin/report'); }} onClick={() => router.push('/admin/report')} className="flex w-full min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#DCB57E] bg-[#fcfcfc]">
                <div className="flex-1 px-4 py-5 flex flex-col">
                  <div>
                    <h2 className="text-md lg:text-xl font-medium mb-0.5" style={{ color: "#DCB57E", fontFamily: '"Genty Sans", sans-serif' }}>Animal Reports</h2>
                    <p className="text-[10px] md:text-xs lg:text-base text-gray-600" style={{ fontFamily: '"Genty Sans", sans-serif' }}>{loading ? '...' : `${animalReports} active reports`}</p>
                  </div>

                  <div className="mt-3 flex-1 flex flex-col gap-3">
                    {recentReports.length === 0 ? (
                      <div className="text-sm text-gray-500">No recent reports</div>
                    ) : (
                      recentReports.map((it) => (
                        <div
                          key={it.report_id || it.created_at}
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/admin/report/${it.report_id}`)}
                          onKeyDown={(e) => { if ((e as any).key === 'Enter') router.push(`/admin/report/${it.report_id}`); }}
                          className="flex items-center gap-3 bg-white rounded-md p-3 shadow-sm hover:bg-gray-50 transition cursor-pointer"
                          aria-label={`View report ${it.animal_name || 'report'}`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {it.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={it.photo_url} alt={it.animal_name || 'Report photo'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No photo</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">{it.animal_name || 'Report'}</div>
                            <div className="text-xs text-gray-500">{(it.animal_description || '').slice(0, 80)}</div>
                          </div>
                          <div className="text-xs font-semibold" style={{ color: it.report_status === 'Accepted' ? '#16a34a' : it.report_status === 'Rejected' ? '#dc2626' : '#d97706' }}>{it.report_status || ''}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4">
                    <Link href="/admin/report" className="block w-full text-center bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-4 py-2 rounded-md shadow">View All Reports →</Link>
                  </div>
                </div>
                <div className="w-24 lg:w-32 flex items-center justify-center bg-[#DCB57E]">
                  <img
                    src="/nav/report.png"
                    alt="Animal Reports"
                    className="w-10 h-10 lg:w-12 lg-h-12"
                  />
                </div>
                </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}