"use client";

import {
  Menu,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state
  // State for user info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setMounted(true); // Set mounted true after hydration

    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
      if (user) {
        setUserEmail(user.email || "");
        // Try to get name from user metadata, fallback to email username
        const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || "";
        setUserName(nameFromMeta || user.email?.split("@")[0] || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    };

    checkAuth();

    // Listen for auth state changes (like logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        const nameFromMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        setUserName(nameFromMeta || session.user.email?.split("@")[0] || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
                  <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm" style={{ color: "#3C3333", fontFamily: "Genty Sans", fontSize: "16px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>{userName}</span>
                  <span className="text-xs text-gray-600" style={{ color: "#3C3333", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal" }}>{userEmail}</span>
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
      {/* Home Icon */}
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
      {/* About Us Icon */}
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
      {/* Mission Icon */}
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

  // Return loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#E1E69D] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  // If authenticated, show user dashboard instead
  if (isAuthenticated) {
    // Dynamically import the UserDashboard component
    const UserDashboard = require("./(user)/page").default;
    return <UserDashboard />;
  }

  return (
    <main className="relative min-h-screen bg-[#E1E69D] flex flex-col items-center overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* --- Hero Container--- */}
      <div className="relative w-full flex flex-col items-center overflow-hidden">
        {/* Ellipse Background */}
        <div className="relative w-full flex justify-center z-0">
          {/* Mobile SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375 389"
            className="absolute top-0 sm:hidden w-[600px] h-auto top-[-26vh]"
          >
            <path
              d="M475.783 187C475.783 298.562 344.602 389 182.783 389C20.9632 389 -110.217 298.562 -110.217 187C-110.217 75.4385 20.9632 -15 182.783 -15C344.602 -15 475.783 75.4385 475.783 187Z"
              fill="#C2C876"
            />
          </svg>

          {/* Tablet SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 768 389"
            className="absolute hidden sm:block lg:hidden w-[900px] h-auto top-[-8vh] z-0"
          >
            <path
              d="M974.403 187C974.403 298.562 705.745 389 374.339 389C42.9326 389 -225.725 298.562 -225.725 187C-225.725 75.4385 42.9326 -15 374.339 -15C705.745 -15 974.403 75.4385 974.403 187Z"
              fill="#C2C876"
            />
          </svg>

          {/* Desktop SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1280 389"
            fill="none"
            preserveAspectRatio="none"
            // Changed md:block to lg:block
            className="absolute hidden lg:block w-full h-auto top-[-20vh]"
          >
            <path
              d="M1624 187C1624 298.562 1176.24 389 623.898 389C71.5543 389 -376.209 298.562 -376.209 187C-376.209 75.4385 71.5543 -15 623.898 -15C1176.24 -15 1624 75.4385 1624 187Z"
              fill="#C2C876"
            />
          </svg>
        </div>

        {/* Header  */}
        <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
          <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <LogIn className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        {/* --- Main Card --- */}
        <div
          className="
            relative 
            w-[90%] 
            max-w-3xl lg:max-w-6xl
            bg-[#E6E6E6] 
            rounded-3xl 
            mt-6 
            shadow-lg 
            flex 
            flex-col 
            justify-between 
            items-center 
            px-4 
            pt-6 pb-8 lg:pt-8 lg:pb-12 
            z-10
            transition-all
          "
        >
          {/* YFA Logo */}
          <div>
            <Image
              src="/YFALogo.png"
              alt="Youth For Animals Logo"
              width={92}
              height={77}
              className="mx-auto"
            />
          </div>

          {/* Moodboard / Main Logo */}
          <div className="mb-4 w-full flex justify-center">
            <Image
              src="/Moodboard2.png"
              alt="Pawject Patrol large logo"
              width={321}
              height={165}
              className="mx-auto object-contain -mt-2 scale-[1.8] sm:scale-[1.3] md:scale-[1.5]"
              priority
            />
          </div>

        {/* Login Button */}
          <Button
            asChild
            className="relative z-10 w-[155px] sm:w-[165px] md:w-[175px] h-[35px] sm:h-[38px] md:h-[40px] bg-[#8D52A7] hover:bg-[#7B4692] text-white font-bold text-sm sm:text-base rounded-lg transition-all lg:-mb-2"
          >
            <Link href="/login">Login</Link>
          </Button>
          {/* View Catalog Button */}
          <div className="absolute bottom-[-20px] sm:bottom-[-24px] md:bottom-[-20px] flex justify-center">
            <Button className="flex w-[155px] sm:w-[165px] md:w-[175px] h-[35px] sm:h-[38px] md:h-[40px] px-4 py-2 items-start gap-[10px] bg-[#8D52A7] hover:bg-[#7B4692] text-white font-bold text-sm sm:text-base rounded-lg shadow-lg transition-all">
              <Link href="/catalog">View Catalog</Link>
            </Button>
          </div>
        </div>

        {/* --- Navigation Section --- */}
        <div className="px-0 pb-0 mt-16 w-full flex justify-center z-10">
          <div className="w-[90%] max-w-6xl bg-[#E6E6E6] rounded-2xl shadow-md p-4 sm:p-5 transition-all">
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 sm:gap-y-6 md:grid-cols-4 md:gap-x-6">
              {[
                { label: "Home", icon: "/PawPrint.png" },
                { label: "About Us", icon: "/PawPrint.png" },
                { label: "Mission", icon: "/PawPrint.png" },
                { label: "Vision", icon: "/PawPrint.png" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="w-10 h-6 flex items-center justify-center">
                    <Image
                      src={item.icon}
                      alt={`${item.label} Icon`}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Image Officers */}
      <div className="relative w-full h-[297px] sm:h-[280px] md:h-[340px] lg:h-[700px] overflow-hidden z-0 mt-6 sm:mt-10">
        <Image
          src="/YFAOfficers.jpg"
          alt="YFA Officers Background"
          fill
          priority
          className="
            object-cover
            object-center
            transition-all duration-500 ease-in-out
          "
        />
      </div>

      {/* About Us, Mission, Vision, and Goals Section */}
      <section className="relative w-full flex flex-col items-center -mt-12 sm:-mt-16 md:-mt-10 z-10 px-0">
        <div className="w-full max-w-none flex flex-col gap-0">
          {/* About Us */}
          <div className="bg-[#8D52A7] text-[#FFFFFF] p-7 sm:p-8 lg:p-12 xl:p-20 rounded-t-3xl shadow-xl">
            <h2
              className="leading-[36px] flex items-center gap-6"
              style={{
                color: "#E6E6E6",
                fontFamily: '"Kawaii RT", sans-serif',
                fontSize: "36px",
                fontWeight: 400,
              }}
            >
              <div className="flex flex-col items-start flex-shrink-0 w-[72px] h-[72px] pt-[16px] px-[16px] pb-0 rounded-2xl bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="w-10 h-10"
                >
                  <path
                    d="M34.0333 7.6333C33.1972 6.79426 32.2037 6.12853 31.1097 5.67428C30.0157 5.22003 28.8429 4.98621 27.6583 4.98621C26.4738 4.98621 25.3009 5.22003 24.207 5.67428C23.113 6.12853 22.1195 6.79426 21.2833 7.6333L20 8.9333L18.7167 7.6333C17.8805 6.79426 16.887 6.12853 15.793 5.67428C14.6991 5.22003 13.5262 4.98621 12.3417 4.98621C11.1571 4.98621 9.98426 5.22003 8.89029 5.67428C7.79632 6.12853 6.80279 6.79426 5.96666 7.6333C2.43332 11.1666 2.21666 17.1333 6.66666 21.6666L20 35L33.3333 21.6666C37.7833 17.1333 37.5667 11.1666 34.0333 7.6333Z"
                    stroke="#E6E6E6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              ABOUT US
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mt-2" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
              Foster kindness, compassion, and respect for all animal life.
              Raise awareness about the shared capacity to feel pain between
              humans and animals, highlighting the importance of treating
              animals with kindness and empathy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row">
            {/* Mission */}
            <div className="bg-[#C575AD] text-[#FFFFFF] p-7 sm:p-8 lg:p-12 xl:p-20 sm:w-1/2">
              <h2
                className="leading-[36px] flex items-center gap-6"
                style={{
                  color: "#E6E6E6",
                  fontFamily: '"Kawaii RT", sans-serif',
                  fontSize: "36px",
                  fontWeight: 400,
                }}
              >
                <div className="flex flex-col items-start flex-shrink-0 w-[72px] h-[72px] pt-[16px] px-[16px] pb-0 rounded-2xl bg-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-10 h-10"
                  >
                    <path
                      d="M3.33334 20C3.33334 20 8.33334 8.33337 20 8.33337C31.6667 8.33337 36.6667 20 36.6667 20C36.6667 20 31.6667 31.6667 20 31.6667C8.33334 31.6667 3.33334 20 3.33334 20Z"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 25C22.7614 25 25 22.7614 25 20C25 17.2386 22.7614 15 20 15C17.2386 15 15 17.2386 15 20C15 22.7614 17.2386 25 20 25Z"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                OUR MISSION
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mt-2" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
                Foster kindness, compassion, and respect for all animal life.
                Raise awareness about the shared capacity to feel pain between
                humans and animals, highlighting the importance of treating
                animals with kindness and empathy.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-[#5E9BBA] text-[#FFFFFF] p-7 sm:p-8 lg:p-12 xl:p-20 sm:w-1/2">
              <h2
                className="leading-[36px] flex items-center gap-6"
                style={{
                  color: "#E6E6E6",
                  fontFamily: '"Kawaii RT", sans-serif',
                  fontSize: "36px",
                  fontWeight: 400,
                }}
              >
                <div className="flex flex-col items-start flex-shrink-0 w-[72px] h-[72px] pt-[16px] px-[16px] pb-0 rounded-2xl bg-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-10 h-10"
                  >
                    <path
                      d="M3.33334 19.9999C3.33334 19.9999 8.33334 8.33325 20 8.33325C31.6667 8.33325 36.6667 19.9999 36.6667 19.9999C36.6667 19.9999 31.6667 31.6666 20 31.6666C8.33334 31.6666 3.33334 19.9999 3.33334 19.9999Z"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 25C22.7614 25 25 22.7614 25 20C25 17.2386 22.7614 15 20 15C17.2386 15 15 17.2386 15 20C15 22.7614 17.2386 25 20 25Z"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                OUR VISION
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mt-2" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
                A compassionate and informed community committed to fostering
                kindness, empathy, and respect for all animals through
                education, responsible pet ownership, and collaborative
                efforts.
              </p>
            </div>
          </div>
          {/* Goals */}
          <div className="bg-[#689668] text-[#FFFFFF] p-7 sm:p-8 lg:p-12 xl:p-20">
            <h2
              className="leading-[36px] flex items-center gap-6"
              style={{
                color: "#E6E6E6",
                fontFamily: '"Kawaii RT", sans-serif',
                fontSize: "36px",
                fontWeight: 400,
              }}
            >
              <div className="flex flex-col items-start flex-shrink-0 w-[72px] h-[72px] pt-[16px] px-[16px] pb-0 rounded-2xl bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="w-10 h-10"
                >
                  <path
                    d="M36.6667 18.4666V19.9999C36.6646 23.594 35.5008 27.0911 33.3489 29.9696C31.1969 32.8482 28.1721 34.9541 24.7256 35.9731C21.279 36.9921 17.5954 36.8698 14.2241 35.6242C10.8528 34.3787 7.97441 32.0768 6.01825 29.0617C4.0621 26.0467 3.13297 22.48 3.36945 18.8938C3.60592 15.3075 4.99533 11.8938 7.33045 9.16173C9.66558 6.42964 12.8213 4.52557 16.327 3.73351C19.8326 2.94145 23.5004 3.30383 26.7833 4.7666"
                    stroke="#E6E6E6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M36.6667 6.6665L20 23.3498L15 18.3498"
                    stroke="#E6E6E6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              OUR GOALS
            </h2>

            <div className="flex flex-col gap-3 mt-2">
              <p
                className="text-sm sm:text-base leading-relaxed p-3"
                style={{
                  borderRadius: "16px",
                  opacity: "0.95",
                  background: "rgba(230, 230, 230, 0.10)",
                  fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif'
                }}
              >
                YFA-UPMin will serve as the primary contact organization for the
                Philippine Animal Welfare Society (PAWS) in coordinating
                disaster relief efforts within the area.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed p-3"
                style={{
                  borderRadius: "16px",
                  opacity: "0.95",
                  background: "rgba(230, 230, 230, 0.10)",
                  fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif'
                }}
              >
                YFA-UPMin, in collaboration with the university, will actively
                implement various programs and activities established by PAWS to
                further the cause of animal welfare nationwide.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed p-3"
                style={{
                  borderRadius: "16px",
                  opacity: "0.95",
                  background: "rgba(230, 230, 230, 0.10)",
                  fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif'
                }}
              >
                YFA-UPMin will actively engage university students in these
                activities, providing them with opportunities to develop
                leadership skills, volunteer in the community, and make a
                positive impact on animal welfare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#D4E088] text-[#333] pt-8 pb-6 relative overflow-hidden w-full">
        {/* --- SVG Background Shape (Mobile) --- */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 375 139"
          fill="none"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-20 sm:hidden"
        >
          <path
            d="M479 202C479 313.562 347.819 404 186 404C24.1806 404 -107 313.562 -107 202C-107 90.4385 24.1806 0 186 0C347.819 0 479 90.4385 479 202Z"
            fill="#C2C876"
          />
        </svg>

        {/* --- SVG Background Shape (Tablet & Up) --- */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 768 139"
          fill="none"
          preserveAspectRatio="none"
          className="hidden absolute bottom-0 left-0 w-full h-20 sm:block"
        >
          <path
            d="M980.992 202C980.992 313.562 712.334 404 380.928 404C49.5218 404 -219.136 313.562 -219.136 202C-219.136 90.4385 49.5218 0 380.928 0C712.334 0 980.992 90.4385 980.992 202Z"
            fill="#C2C876"
          />
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <Image
                src="/YFALogo.png"
                alt="Youth for Animals Logo"
                width={120}
                height={120}
              />
            </div>
            <p className="text-sm sm:text-base leading-relaxed mb-4 max-w-sm" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
              Youth for Animals - UP Mindanao is dedicated to fostering
              kindness, compassion, and respect for all forms of animal life.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
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
                href="#"
                className="bg-[#9BBF94] p-2 rounded-full text-white hover:opacity-80"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 text-[#4E4E4E]">
              Quick Links
            </h3>
            <ul className="space-y-1 text-sm" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
              <li>
                <a href="#" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Our Mission
                </a>
              </li>
<li>
                <a href="#" className="hover:underline">
                  Programs
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Get Involved
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 text-[#4E4E4E]">
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm" style={{ fontFamily: 'Help_Loyola Round, "Kawaii RT", sans-serif' }}>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#8D52A7]" />
                yfaupmindanao@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#5E9BBA]" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[#689668]" />
                UP Mindanao, Bago Oshiro, Davao City
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}