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
import Sidebar from "@/components/Sidebar";

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

  return (
    <main className="min-h-screen bg-[#E1E69D]">
      {/* Sidebar */}
      <Sidebar
          variant="admin"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        userEmail={userEmail}
        router={router}
      />

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
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/admin/login");
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <LogIn className="w-6 h-6 text-gray-800" />
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