"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Menu,
  LogIn,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import { supabase } from "@/utils/supabase/client";

// Global storage for photo file during form navigation
let globalPhotoFile: File | null = null;

export function setGlobalPhotoFile(file: File | null) {
  globalPhotoFile = file;
}

export function getGlobalPhotoFile() {
  return globalPhotoFile;
}

// Event type aliases
type InputChange = React.ChangeEvent<HTMLInputElement>;
type TextareaChange = React.ChangeEvent<HTMLTextAreaElement>;
type SelectChange = React.ChangeEvent<HTMLSelectElement>;

interface FieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: InputChange) => void;
}

interface SelectFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (e: SelectChange) => void;
}

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: TextareaChange) => void;
}

export default function ReportFormSample() {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [lat, setLat] = useState<number | null>(7.0858);
  const [lng, setLng] = useState<number | null>(125.4853);

  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const [reporterName, setReporterName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [dateSeen, setDateSeen] = useState("");
  const [physicalDescription, setPhysicalDescription] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [road, setRoad] = useState("");
  const [hasHealthIssues, setHasHealthIssues] = useState<boolean>(false);
  const [healthDetails, setHealthDetails] = useState<string>("");
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [collarDetails, setCollarDetails] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "location" | "health">(
    "basic"
  );

  // Auth-connected sidebar state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem("animalReportFormData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setReporterName(data.reporterName || "");
        setAnimalType(data.animalType || "");
        setGender(data.gender || "Unknown");
        setDateSeen(data.dateSeen || "");
        setPhysicalDescription(data.physicalDescription || "");
        setOtherInfo(data.otherInfo || "");
        setArea(data.area || "");
        setLandmark(data.landmark || "");
        setRoad(data.road || "");
        setHasHealthIssues(data.hasHealthIssues || false);
        setHealthDetails(data.healthDetails || "");
        setHasCollar(data.hasCollar || false);
        setCollarDetails(data.collarDetails || "");
        setLat(data.lat || 7.0858);
        setLng(data.lng || 125.4853);

        if (data.photoPreview) {
          setPreview(data.photoPreview);
        }
        sessionStorage.removeItem("animalReportFormData");
      } catch (error) {
        console.error("Failed to restore form data:", error);
      }
    }
  }, []);

  // Fetch current user and keep sidebar info in sync
  useEffect(() => {
    const setupAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        const nameFromMeta =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          "";
        setUserName(nameFromMeta || user.email?.split("@")[0] || "");
        setUserEmail(user.email || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    };
    setupAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        const nameFromMeta =
          (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          "";
        setUserName(nameFromMeta || session.user.email?.split("@")[0] || "");
        setUserEmail(session.user.email || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  function grabCurrentLocation() {
    if (!navigator.geolocation) {
      setResultMsg("Geolocation unsupported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => setResultMsg(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleMapClick(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    setResultMsg(null);
  }

  async function handleConfirm() {
    setResultMsg(null);

    if (!reporterName.trim()) {
      setResultMsg("Please enter your name before proceeding.");
      setActiveTab("basic");
      return;
    }

    if (lat == null || lng == null) {
      setResultMsg("Please capture location before proceeding.");
      return;
    }

    const formData: any = {
      reporterName,
      animalType,
      gender,
      dateSeen,
      physicalDescription,
      otherInfo,
      area,
      landmark,
      road,
      hasHealthIssues,
      healthDetails,
      hasCollar,
      collarDetails,
      lat,
      lng,
      photoPreview: preview,
    };

    sessionStorage.setItem("animalReportFormData", JSON.stringify(formData));

    // Store photo file globally for access on confirm page
    setGlobalPhotoFile(photoFile);

    const params = new URLSearchParams({
      reporterName: reporterName || "",
      animalType: animalType || "",
      gender: gender || "Unknown",
      dateSeen: dateSeen || "",
      physicalDescription: physicalDescription || "",
      area: area || "",
      landmark: landmark || "",
      road: road || "",
      healthIssues: hasHealthIssues ? healthDetails || "Yes" : "None",
      animalCollar: hasCollar ? collarDetails || "Has collar" : "None",
      otherInfo: otherInfo || "None",
      lat: lat.toString(),
      lng: lng.toString(),
      photoUrl: preview || "",
    });

    router.push(`/form/confirm?${params.toString()}`);
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
              {isAuthenticated ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {(userName || "?").charAt(0).toUpperCase()}
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
                      {userName || ""}
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
                      {userEmail || ""}
                    </span>
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
                    router.push("/");
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
    <main className="min-h-screen bg-[#E6E6E6] ">
      <Sidebar />
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
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <LogIn className="w-6 h-6 text-gray-800" />
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Text */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              color: "#C2C876",
              WebkitTextStrokeWidth: ".5px",
              WebkitTextStrokeColor: "#3C3333",
              fontFamily: '"Kawaii RT", sans-serif',
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              outlineColor: "#3C3333",
            }}
          >
            Report Animal Form
          </h1>

          <p
            className="text-xs sm:text-sm md:text-md"
            style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
          >
            Fill up the details in the form to catalog another animal
          </p>
        </div>

        {/* Form Container */}
        <div
          className="rounded-xl bg-[#E1E69D] border-radius-[26px] border-1 border-[#3C3333] p-6"
          style={{
            display: "flex",
            minWidth: "327px",
            padding: "20px",
            flexDirection: "column",
            gap: "15px",
            alignSelf: "stretch",
          }}
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "basic"
                  ? "bg-[#8D52A7] text-white"
                  : "bg-[#C2C876] text-[#3C3333] hover:bg-[#b5bb6a]"
              }`}
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21"
                    stroke={activeTab === "basic" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke={activeTab === "basic" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden md:inline">Basic Info</span>
            </button>

            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "location"
                  ? "bg-[#8D52A7] text-white"
                  : "bg-[#C2C876] text-[#3C3333] hover:bg-[#b5bb6a]"
              }`}
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z"
                    stroke={activeTab === "location" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 3V18"
                    stroke={activeTab === "location" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 6V21"
                    stroke={activeTab === "location" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden md:inline">Location</span>
            </button>

            <button
              onClick={() => setActiveTab("health")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "health"
                  ? "bg-[#8D52A7] text-white"
                  : "bg-[#C2C876] text-[#3C3333] hover:bg-[#b5bb6a]"
              }`}
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11 2C10.4696 2 9.96086 2.21071 9.58579 2.58579C9.21071 2.96086 9 3.46957 9 4V9H4C3.46957 9 2.96086 9.21071 2.58579 9.58579C2.21071 9.96086 2 10.4696 2 11V13C2 14.1 2.9 15 4 15H9V20C9 21.1 9.9 22 11 22H13C13.5304 22 14.0391 21.7893 14.4142 21.4142C14.7893 21.0391 15 20.5304 15 20V15H20C20.5304 15 21.0391 14.7893 21.4142 14.4142C21.7893 14.0391 22 13.5304 22 13V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H15V4C15 3.46957 14.7893 2.96086 14.4142 2.58579C14.0391 2.21071 13.5304 2 13 2H11Z"
                    stroke={activeTab === "health" ? "#FFFFFF" : "#3C3333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden md:inline">Health & Details</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* Basic Info Tab  */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <Field
                  label="Reporter Name"
                  placeholder="Your name"
                  value={reporterName}
                  onChange={(e: InputChange) => setReporterName(e.target.value)}
                />
                <Field
                  label="Type of animal"
                  placeholder="Dog, Cat, etc."
                  value={animalType}
                  onChange={(e: InputChange) => setAnimalType(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Gender"
                    options={["Unknown", "Male", "Female"]}
                    value={gender}
                    onChange={(e: SelectChange) => setGender(e.target.value)}
                  />
                  <Field
                    label="Date Seen"
                    type="date"
                    value={dateSeen}
                    onChange={(e: InputChange) => setDateSeen(e.target.value)}
                  />
                </div>

                <TextArea
                  label="Physical Description"
                  placeholder="Color, size, markings, etc."
                  value={physicalDescription}
                  onChange={(e: TextareaChange) => setPhysicalDescription(e.target.value)}
                />
                <div className="rounded-xl bg-[#E6E6E6] p-4 flex flex-col items-center justify-center">
                  <div
                    className="w-full h-[280px] rounded-lg bg-white flex items-center justify-center overflow-hidden cursor-pointer border-2 border-[#3C3333]"
                    onClick={() =>
                      document.getElementById("photo-input")?.click()
                    }
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Animal photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-600 text-sm gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                        >
                          <path
                            d="M29 8H19L14 14H8C6.93913 14 5.92172 14.4214 5.17157 15.1716C4.42143 15.9217 4 16.9391 4 18V36C4 37.0609 4.42143 38.0783 5.17157 38.8284C5.92172 39.5786 6.93913 40 8 40H40C41.0609 40 42.0783 39.5786 42.8284 38.8284C43.5786 38.0783 44 37.0609 44 36V18C44 16.9391 43.5786 15.9217 42.8284 15.1716C42.0783 14.4214 41.0609 14 40 14H34L29 8Z"
                            stroke="#3C3333"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M24 32C27.3137 32 30 29.3137 30 26C30 22.6863 27.3137 20 24 20C20.6863 20 18 22.6863 18 26C18 29.3137 20.6863 32 24 32Z"
                            stroke="#3C3333"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            color: "#3C3333",
                            fontFamily: '"Genty Sans", sans-serif',
                            fontSize: "16px",
                            fontWeight: 500,
                          }}
                        >
                          Picture
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    id="photo-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg"
                    className="hidden"
                    onChange={(e: InputChange) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setPreview(null);
                        setPhotoFile(null);
                        return;
                      }
                      const url = URL.createObjectURL(file);
                      setPreview(url);
                      setPhotoFile(file);
                    }}
                  />
                  <p className="mt-3 text-xs text-[#000]">
                    Tap to upload (optional)
                  </p>
                </div>
              </div>
            )}

            {/* Location Tab - Details */}
            {activeTab === "location" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <Field
                      label="Area Seen"
                      placeholder="General area"
                      value={area}
                      onChange={(e: InputChange) => setArea(e.target.value)}
                    />
                    <Field
                      label="Landmark Near Location"
                      placeholder="Known landmark"
                      value={landmark}
                      onChange={(e: InputChange) => setLandmark(e.target.value)}
                    />
                    <Field
                      label="What Road?"
                      placeholder="Street / road name"
                      value={road}
                      onChange={(e: InputChange) => setRoad(e.target.value)}
                    />
                  </div>
                </div>

                {/* Map */}
                <div className="rounded-xl bg-[#E6E6E6] p-4 mt-2">
                  <div className="rounded-lg h-64 bg-[#E1E69D] overflow-hidden relative">
                    <div className="absolute inset-0 z-10">
                      <MapView
                        latitude={lat!}
                        longitude={lng!}
                        onLocationSelect={handleMapClick}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={grabCurrentLocation}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-[#8D52A7] text-white text-xs hover:bg-[#7B4692] shadow z-50"
                    >
                      Use My Location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Health & Details Tab */}
            {activeTab === "health" && (
              <div className="space-y-4">
                {/* Health Issues */}
                <div className="rounded-xl bg-[#E1E69D] p-4">
                  <label
                    className="block mb-3"
                    style={{
                      color: "#3C3333",
                      fontFamily: '"Genty Sans", sans-serif',
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Health Issues?
                  </label>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="health"
                        className="accent-[#8D52A7] outline-none"
                        checked={!hasHealthIssues}
                        onChange={() => setHasHealthIssues(false)}
                      />
                      <span>No</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="health"
                        className="accent-[#8D52A7] outline-none"
                        checked={hasHealthIssues}
                        onChange={() => setHasHealthIssues(true)}
                      />
                      <span>Yes</span>
                    </label>
                    {hasHealthIssues && (
                      <input
                        className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
                        style={{ backgroundColor: "#C2C876" }}
                        placeholder="Describe"
                        value={healthDetails}
                        onChange={(e: InputChange) => setHealthDetails(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* Collar */}
                <div className="rounded-xl bg-[#E1E69D] p-4">
                  <label
                    className="block mb-3"
                    style={{
                      color: "#3C3333",
                      fontFamily: '"Genty Sans", sans-serif',
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Has Collar?
                  </label>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="collar"
                        className="accent-[#8D52A7] outline-none"
                        checked={!hasCollar}
                        onChange={() => setHasCollar(false)}
                      />
                      <span>No</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="collar"
                        className="accent-[#8D52A7] outline-none"
                        checked={hasCollar}
                        onChange={() => setHasCollar(true)}
                      />
                      <span>Yes</span>
                    </label>
                    {hasCollar && (
                      <input
                        className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
                        style={{ backgroundColor: "#C2C876" }}
                        placeholder="Describe"
                        value={collarDetails}
                        onChange={(e: InputChange) => setCollarDetails(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <TextArea
                  label="Any Other Information"
                  placeholder="Any additional details..."
                  value={otherInfo}
                  onChange={(e: TextareaChange) => setOtherInfo(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 mt-6">
            {activeTab !== "basic" && (
              <button
                onClick={() => {
                  if (activeTab === "location") setActiveTab("basic");
                  if (activeTab === "health") setActiveTab("location");
                }}
                type="button"
                className="flex-1 rounded-lg bg-[#E6E6E6] py-3 text-sm font-semibold text-[#3C3333] hover:bg-gray-300 transition"
              >
                Previous
              </button>
            )}
            <button
              onClick={
                activeTab === "health"
                  ? handleConfirm
                  : () =>
                      setActiveTab(
                        activeTab === "basic" ? "location" : "health"
                      )
              }
              type="button"
              className="flex-1 rounded-lg bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692] transition"
            >
              {activeTab === "health" ? "Confirm" : "Next"}
            </button>
          </div>
          {resultMsg && (
            <p className="mt-3 text-xs text-[#3C3333] text-center px-4">
              {resultMsg}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, placeholder, type = "text", value, onChange }: FieldProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-4">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
        style={{ backgroundColor: "#C2C876" }}
      />
    </div>
  );
}

function SelectField({ label, options, value, onChange }: SelectFieldProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-4">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
        style={{ backgroundColor: "#C2C876" }}
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange }: TextAreaProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-4">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "14px",
        }}
      >
        {label}
      </label>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
        style={{ backgroundColor: "#C2C876" }}
      />
    </div>
  );
}