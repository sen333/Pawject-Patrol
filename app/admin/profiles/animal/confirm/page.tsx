"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createAnimalProfile } from "@/actions/profiles/admin";
import {
  Menu,
  LogIn,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

const AdminMapView = dynamic(() => import("@/components/AdminMapView"), { ssr: false });

// Display Components
function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
      <label className="block text-sm font-medium text-[#3C3333] mb-2">{label}</label>
      <p className="text-sm text-[#3C3333]">{value}</p>
    </div>
  );
}

function DisplayTextArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
      <label className="block text-sm font-medium text-[#3C3333] mb-2">{label}</label>
      <p className="text-sm text-[#3C3333] whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Extract URL parameters
  const recorderName = searchParams.get("recorder_name") || searchParams.get("recorderName") || "";
  const animalName = searchParams.get("animal_name") || searchParams.get("animalName") || "";
  const animalType = searchParams.get("animal_type") || searchParams.get("animalType") || "";
  const gender = searchParams.get("animal_gender") || searchParams.get("gender") || "Unknown";
  const dateSeen = searchParams.get("date_seen") || searchParams.get("dateSeen") || "";
  const physicalDescription = searchParams.get("animal_description") || searchParams.get("physicalDescription") || "";
  const area = searchParams.get("area") || "";
  const landmark = searchParams.get("landmark") || "";
  const road = searchParams.get("road") || "";
  const breed = searchParams.get("animal_breed") || searchParams.get("breed") || searchParams.get("animalBreed") || "";
  const vaccinationStatus = searchParams.get("vaccination_status") || searchParams.get("vaccinationStatus") || "";
  const healthIssues = searchParams.get("health_issues") || searchParams.get("healthIssues") || "";
  const animalStatus = searchParams.get("animal_status") || searchParams.get("status") || "";
  const animalCollar = searchParams.get("animal_collar") || searchParams.get("animalCollar") || "";
  const otherInfo = searchParams.get("other_information") || searchParams.get("otherInfo") || "";
  const animalTheme = searchParams.get("animal_theme") || searchParams.get("theme") || searchParams.get("animalTheme") || "";
  const lat = parseFloat(searchParams.get("latitude") || searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("longitude") || searchParams.get("lng") || "0");
  const photoUrl = searchParams.get("photo_url") || searchParams.get("photoUrl") || "";

  // Fetch user on mount
  useEffect(() => {
    const setupAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      setUserName(user.user_metadata?.name || "Admin");
      setUserEmail(user.email || "admin@pawjectpatrol.com");
    };
    setupAuth();
  }, [router]);

  // Restore photo from session storage
  useEffect(() => {
    const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);
      if (data.photoBase64 && data.photoName && data.photoType) {
        fetch(data.photoBase64)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], data.photoName, { type: data.photoType });
            setPhotoFile(file);
          })
          .catch((err) => console.error("Failed to fetch base64 blob:", err));
        return;
      }

      if (data.photoPreview) {
        fetch(data.photoPreview)
          .then((res) => res.blob())
          .then((blob) => {
            const filename = data.photoName || `animal_${Date.now()}.jpg`;
            const type = data.photoType || blob.type || "image/jpeg";
            const file = new File([blob], filename, { type });
            setPhotoFile(file);
          })
          .catch((err) => console.error("Failed to fetch preview blob:", err));
        return;
      }
    } catch (error) {
      console.error("Failed to restore photo/session data:", error);
    }
  }, []);

  // Map theme to color
  const getThemeColor = (t: string) => {
    const theme = (t || "").toLowerCase();
    switch (theme) {
      case "green":
        return "#9BBF94";
      case "orange":
        return "#DCB57E";
      case "pink":
        return "#C575AD";
      case "blue":
      default:
        return "#5E9BBA";
    }
  };

  // Handle submit
  async function handleConfirmSubmit() {
    setSubmitting(true);
    setResultMsg(null);
    try {
      let dateSeenWithTime: string | undefined = undefined;
      if (dateSeen) {
        const now = new Date();
        const selectedDate = new Date(dateSeen);
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        dateSeenWithTime = selectedDate.toISOString();
      }

      let fileToSend: File | undefined = photoFile || undefined;
      let sendBase64: string | undefined = undefined;

      try {
        const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.photoBase64 && data.photoName && data.photoType) {
            if (!fileToSend) sendBase64 = data.photoBase64;
            if (!fileToSend) {
              const res = await fetch(data.photoBase64);
              const blob = await res.blob();
              fileToSend = new File([blob], data.photoName, { type: data.photoType });
            }
          }
        }
      } catch (err) {
        console.error("Error restoring photo before submit:", err);
      }

      const res = await createAnimalProfile({
        recorder_name: recorderName || undefined,
        animal_name: animalName || undefined,
        animal_type: animalType || "other",
        animal_breed: breed || undefined,
        vaccination_status: vaccinationStatus || undefined,
        animal_gender: gender as string,
        animal_status: animalStatus || undefined,
        date_seen: dateSeenWithTime,
        animal_description: physicalDescription || undefined,
        area: area || undefined,
        landmark: landmark || undefined,
        road: road || undefined,
        health_issues: healthIssues || undefined,
        animal_collar: animalCollar || undefined,
        other_information: otherInfo || undefined,
        animal_theme: animalTheme || undefined,
        latitude: lat,
        longitude: lng,
        photo: fileToSend || undefined,
        photoBase64: sendBase64 || undefined,
        photoUrl: undefined,
      });

      if (!res.success) {
        setResultMsg(res.error ?? "Failed to submit");
      } else {
        setResultMsg("Report submitted successfully!");
        sessionStorage.removeItem("animalReportFormData");
        sessionStorage.removeItem("animalProfileFormData");
        setTimeout(() => router.push("/admin/profiles"), 2000);
      }
    } catch (e: any) {
      setResultMsg(e.message);
    } finally {
      setSubmitting(false);
    }
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
    <main className="min-h-screen bg-[#E1E69D]">
      <Sidebar />

      {/* Header */}
      <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between pl-[24px] pr-[24px]">
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200"
            aria-label="Menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
          <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-1.5 rounded-md text-sm bg-[#8D52A7] text-white hover:bg-[#7B4692]"
          >
            Dashboard
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6 pl-[24px] pr-[24px]">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-purple-700 hover:underline flex items-center gap-1"
          >
            ← Back to Form
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Your Report</h1>

        <div className="rounded-xl border border-gray-300 bg-[#E6E6E6]/40 backdrop-blur-sm p-5 md:p-6 space-y-5">
          {/* Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
            {/* Photo Panel */}
            <div className="rounded-xl bg-[#CFC9C9] p-2 flex flex-col">
              <div className="w-full h-[300px] rounded-lg bg-[#DED8D8] border border-gray-300 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Animal photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-600 text-sm gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>No Photo</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-700">Photo Preview</p>
            </div>

            {/* Fields Panel */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Recorder Name" value={recorderName || "—"} />
                <DisplayField label="Animal Name" value={animalName || "—"} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Type of animal" value={animalType || "—"} />
                <div className="grid grid-cols-2 gap-3">
                  <DisplayField label="Gender" value={gender} />
                  <DisplayField label="Date Seen" value={dateSeen ? new Date(dateSeen).toLocaleDateString() : "—"} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Breed" value={breed || "—"} />
                <DisplayField label="Vaccination Status" value={vaccinationStatus || "—"} />
              </div>
              <DisplayTextArea label="Physical Description" value={physicalDescription || "—"} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
                  <label className="block text-sm font-medium text-[#3C3333] mb-2">Theme</label>
                  <div
                    style={{
                      width: 36,
                      height: 28,
                      backgroundColor: getThemeColor(animalTheme),
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <DisplayField label="Area Seen (Location)" value={area || "—"} />
            <DisplayField label="Landmark Near Location" value={landmark || "—"} />
            <DisplayField label="What Road?" value={road || "—"} />
          </div>

          {/* Map */}
          {lat && lng && (
            <div className="rounded-xl bg-[#CFC9C9] p-4 mt-6">
              <label className="block text-sm font-medium mb-2 text-gray-800">Location on Map</label>
              <div className="rounded-lg h-72 md:h-80 bg-[#DED8D8] overflow-hidden">
                <AdminMapView latitude={lat} longitude={lng} />
              </div>
            </div>
          )}

          {/* Health & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DisplayField label="Health Issues" value={healthIssues || "None"} />
            <DisplayField label="Collar" value={animalCollar || "None"} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DisplayField label="Animal Status" value={animalStatus || "—"} />
          </div>

          {/* Other Info */}
          <DisplayTextArea label="Any Other Information" value={otherInfo || "None"} />

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={() => router.push("/admin/profiles/animal")}
              className="flex-1 rounded-md border-2 border-gray-400 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
            >
              Edit Report
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="flex-1 rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
          {resultMsg && <p className="mt-2 text-sm text-gray-800 text-center font-medium">{resultMsg}</p>}
        </div>
      </section>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#E1E69D] flex items-center justify-center">
          <p className="text-sm">Loading confirmation...</p>
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}