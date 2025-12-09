"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import {
  Menu,
  LogIn,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  ArrowRight,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

	  // User info state for sidebar
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Let component be mounted in browser
    let isMounted = true;

    // Check if user is authenticated
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);
      setLoading(false);
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

  // Return loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-200 via-yellow-100 to-yellow-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

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

          <button
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
          </button>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-auto">
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
    </>
  );

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#E1E69D]">
      {/* Sidebar */}
        <Sidebar />
      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
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
                Welcome back, <span style={{ color: "#5E9BBA" }}>Pawject</span>{" "}
                <span style={{ color: "#C2C876" }}>Patrol</span>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M19.333 2.6665H7.99967C7.29243 2.6665 6.61415 2.94746 6.11406 3.44755C5.61396 3.94765 5.33301 4.62593 5.33301 5.33317V26.6665C5.33301 27.3737 5.61396 28.052 6.11406 28.5521C6.61415 29.0522 7.29243 29.3332 7.99967 29.3332H23.9997C24.7069 29.3332 25.3852 29.0522 25.8853 28.5521C26.3854 28.052 26.6663 27.3737 26.6663 26.6665V9.99984L19.333 2.6665Z"
                        stroke="#5E9BBA"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M18.667 2.6665V10.6665H26.667"
                        stroke="#5E9BBA"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M21.3337 17.3335H10.667"
                        stroke="#5E9BBA"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M21.3337 22.6665H10.667"
                        stroke="#5E9BBA"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13.3337 12H10.667"
                        stroke="#5E9BBA"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

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
                    0
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M14.6667 7.99984C16.1394 7.99984 17.3333 6.80593 17.3333 5.33317C17.3333 3.86041 16.1394 2.6665 14.6667 2.6665C13.1939 2.6665 12 3.86041 12 5.33317C12 6.80593 13.1939 7.99984 14.6667 7.99984Z"
                        stroke="#689668"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M24 13.3332C25.4728 13.3332 26.6667 12.1393 26.6667 10.6665C26.6667 9.19374 25.4728 7.99984 24 7.99984C22.5272 7.99984 21.3333 9.19374 21.3333 10.6665C21.3333 12.1393 22.5272 13.3332 24 13.3332Z"
                        stroke="#689668"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M26.6667 23.9998C28.1394 23.9998 29.3333 22.8059 29.3333 21.3332C29.3333 19.8604 28.1394 18.6665 26.6667 18.6665C25.1939 18.6665 24 19.8604 24 21.3332C24 22.8059 25.1939 23.9998 26.6667 23.9998Z"
                        stroke="#689668"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12 13.3332C12.8755 13.3332 13.7424 13.5056 14.5512 13.8406C15.3601 14.1757 16.095 14.6667 16.714 15.2858C17.3331 15.9048 17.8242 16.6398 18.1592 17.4486C18.4942 18.2575 18.6667 19.1244 18.6667 19.9998V24.6665C18.6663 25.7818 18.2665 26.8601 17.5398 27.706C16.813 28.552 15.8073 29.1097 14.7048 29.2781C13.6023 29.4466 12.4759 29.2146 11.5297 28.6242C10.5835 28.0339 9.88001 27.1241 9.54666 26.0598C8.97777 24.2243 7.77777 23.0221 5.94666 22.4532C4.8829 22.12 3.97355 21.417 3.38314 20.4715C2.79273 19.526 2.56028 18.4004 2.72784 17.2983C2.8954 16.1963 3.45191 15.1906 4.29667 14.4633C5.14142 13.736 6.21861 13.3351 7.33332 13.3332H12Z"
                        stroke="#689668"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

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
                      color: "#689668",
                      fontFamily: '"Genty Sans", sans-serif',
                    }}
                  >
                    0
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M25.3337 28V25.3333C25.3337 23.9188 24.7718 22.5623 23.7716 21.5621C22.7714 20.5619 21.4148 20 20.0003 20H12.0003C10.5858 20 9.22928 20.5619 8.22909 21.5621C7.2289 22.5623 6.66699 23.9188 6.66699 25.3333V28"
                        stroke="#C575AD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16.0003 14.6667C18.9458 14.6667 21.3337 12.2789 21.3337 9.33333C21.3337 6.38781 18.9458 4 16.0003 4C13.0548 4 10.667 6.38781 10.667 9.33333C10.667 12.2789 13.0548 14.6667 16.0003 14.6667Z"
                        stroke="#C575AD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

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
                    0
                  </div>
                </a>
              </div>

              {/* Volunteer Opportunities Card */}
              <div className="relative flex flex-col items-start gap-[15.989px] mt-8">
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

                {/* Card Wrapper  */}
                <div className="relative w-full">
                  {/* Left Button */}
                  <button className="absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#8D52A7] flex items-center justify-center hover:bg-gray-50 shadow-md transition-transform active:scale-95">
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
                  <button className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#8D52A7] flex items-center justify-center hover:bg-gray-50 shadow-md transition-transform active:scale-95">
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

                  {/* The Card Content */}
                  <div
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
                      Weekend Adoption
                      <br />
                      Fair
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
                          2025-12-16
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
                          10:00 AM - 4:00 PM
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

                        {/* Location Text */}
                        <span
                          className="text-sm"
                          style={{
                            color: "#3C3333",
                            fontFamily: '"Genty Sans", sans-serif',
                          }}
                        >
                          City Park
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
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 w-full mt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8D52A7] opacity-30"></div>
                  <div className="w-8 h-2.5 rounded-full bg-[#8D52A7]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8D52A7] opacity-30"></div>
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
                  <button
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
                  </button>
                </div>

                {/* Stacked List Container */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Item 1 */}
                  <div className="flex items-start justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <img
                        src="https://placekitten.com/100/100"
                        className="w-[60px] h-[60px] rounded-lg object-cover bg-gray-200"
                      />

                      {/* Text Details */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[#3C3333] text-sm leading-tight font-['Genty_Sans']">
                          Stray Cat Sighting
                        </h4>
                        <span className="text-[#3C3333]  text-xs font-['Genty_Sans']">
                          Cat (Male)
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          UP Mindanao • near EBL Dormitory
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          12/7/2025, 9:04:34 PM
                        </span>

                        {/* Status Badge */}
                        <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] px-2 py-0.5 rounded-full w-fit mt-1 font-['Genty_Sans']">
                          Pending
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

                  {/* Item 2 */}
                  <div className="flex items-start justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <img
                        src="https://placekitten.com/101/101"
                        className="w-[60px] h-[60px] rounded-lg object-cover bg-gray-200"
                      />

                      {/* Text Details */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[#3C3333] text-sm leading-tight font-['Genty_Sans']">
                          mark was here
                        </h4>
                        <span className="text-[#3C3333] text-xs font-['Genty_Sans']">
                          Cat (Male)
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          Mintal • near UP Library
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          12/4/2025, 12:01:10 PM
                        </span>

                        {/* Status Badge */}
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full w-fit mt-1 font-['Genty_Sans']">
                          Accepted
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

                  {/* Item 3 */}
                  <div className="flex items-start justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <img
                        src="https://placedog.net/100/100"
                        alt="Report Thumbnail"
                        className="w-[60px] h-[60px] rounded-lg object-cover bg-gray-200"
                      />

                      {/* Text Details */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[#3C3333]  text-sm leading-tight font-['Genty_Sans']">
                          Untitled Report
                        </h4>
                        <span className="text-[#3C3333] text-xs font-['Genty_Sans']">
                          Dog (Male)
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          Mintal • near Castillo Eatery
                        </span>
                        <span className="text-gray-500 text-[10px] leading-tight font-['Genty_Sans']">
                          11/29/2025, 1:15:05 PM
                        </span>

                        {/* Status Badge */}
                        <span className="bg-red-100 text-red-700 text-[10px]  px-2 py-0.5 rounded-full w-fit mt-1 font-['Genty_Sans']">
                          Rejected
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
                </div>
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
                  {/* Animal Reports QA Card*/}
                  <a
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
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M82 113.75V117.812"
                          stroke="#A5885F"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M115.312 132.031H130.688L123 138.125L115.312 132.031Z"
                          stroke="#A5885F"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M45.3051 91.3821C42.4364 100.163 40.9898 109.197 41.0001 118.268C41.0001 152.165 77.7156 170.625 123 170.625C168.285 170.625 205 152.165 205 118.268C205 109.647 203.34 100.393 199.947 91.3821M105.206 41.9659C111.067 41.0531 117.027 40.6041 123 40.6252C130.995 40.6252 138.375 41.5027 145.15 43.1115"
                          stroke="#A5885F"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </a>

                  {/* Animal Report QA Card */}
                  <a
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
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M104.417 12.0835V48.3335H149.167"
                          stroke="#47748C"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </a>
                  {/* Volunteer Request QA Card */}
                  <a
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
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M104.416 74.5832V29.8332C104.416 25.877 102.845 22.0829 100.047 19.2855C97.2499 16.4881 93.4558 14.9165 89.4997 14.9165C85.5435 14.9165 81.7494 16.4881 78.952 19.2855C76.1546 22.0829 74.583 25.877 74.583 29.8332V44.7498"
                          stroke="#945882"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M74.5833 78.3127V44.7502C74.5833 40.794 73.0118 36.9999 70.2143 34.2025C67.4169 31.4051 63.6228 29.8335 59.6667 29.8335C55.7105 29.8335 51.9164 31.4051 49.119 34.2025C46.3216 36.9999 44.75 40.794 44.75 44.7502V104.417"
                          stroke="#945882"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M134.25 59.6667C134.25 55.7105 135.821 51.9164 138.619 49.119C141.416 46.3216 145.21 44.75 149.166 44.75C153.122 44.75 156.917 46.3216 159.714 49.119C162.511 51.9164 164.083 55.7105 164.083 59.6667V104.417C164.083 120.241 157.797 135.418 146.607 146.607C135.417 157.797 120.241 164.083 104.416 164.083H89.4996C68.6163 164.083 55.9371 157.669 44.8242 146.631L17.9742 119.781C15.4081 116.939 14.0331 113.219 14.1341 109.391C14.2351 105.563 15.8042 101.921 18.5166 99.2179C21.229 96.5151 24.8769 94.9589 28.7051 94.8715C32.5332 94.7841 36.2484 96.1721 39.0813 98.7483L52.208 111.875"
                          stroke="#945882"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>{" "}
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
