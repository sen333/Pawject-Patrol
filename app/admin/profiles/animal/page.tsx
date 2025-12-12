"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { ReportTheme } from "@/actions/profiles/admin";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase/client";
import {
  Menu,
  LogIn,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// Small form component prop types
type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
};

type SelectFieldProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  id?: string;
};

type TextAreaProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
};

export default function ReportFormSample() {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [lat, setLat] = useState<number | null>(7.0858);
  const [lng, setLng] = useState<number | null>(125.4853);

  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const [recorderName, setRecorderName] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [dateSeen, setDateSeen] = useState("");
  const [physicalDescription, setPhysicalDescription] = useState("");
  const [vaccinationStatus, setVaccinationStatus] = useState("");
  const [animalStatus, setAnimalStatus] = useState("Unknown");
  const [otherInfo, setOtherInfo] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [road, setRoad] = useState("");
  const [theme, setTheme] = useState<ReportTheme>("blue");
  const [hasHealthIssues, setHasHealthIssues] = useState<boolean>(false);
  const [healthDetails, setHealthDetails] = useState<string>("");
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [collarDetails, setCollarDetails] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for user info
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // support both camelCase and snake_case stored snapshots
        setRecorderName(data.recorderName || data.recorder_name || "");
        setAnimalName(data.animalName || data.animal_name || "");
        setAnimalType(data.animalType || data.animal_type || "");
        setBreed(data.breed || data.animal_breed || "");
        setVaccinationStatus(data.vaccinationStatus || data.vaccination_status || "");
        setAnimalStatus(data.animalStatus || data.animal_status || "Unknown");
        setGender(data.gender || data.animal_gender || "Unknown");
        setDateSeen(data.dateSeen || data.date_seen || "");
        setPhysicalDescription(data.physicalDescription || data.animal_description || "");
        setOtherInfo(data.otherInfo || data.other_information || "");
        setArea(data.area || "");
        setLandmark(data.landmark || "");
        setRoad(data.road || "");
        setTheme(data.theme || data.animal_theme || "blue");
        setHasHealthIssues(data.hasHealthIssues || false);
        setHealthDetails(data.healthDetails || data.health_details || "");
        setHasCollar(data.hasCollar || false);
        setCollarDetails(data.collarDetails || data.collar_details || "");
        setLat(data.lat ?? data.latitude ?? 7.0858);
        setLng(data.lng ?? data.longitude ?? 125.4853);

        if (data.photoPreview) {
          setPreview(data.photoPreview);
          if (data.photoBase64 && data.photoName && data.photoType) {
            fetch(data.photoBase64)
              .then((res) => res.blob())
              .then((blob) => {
                const file = new File([blob], data.photoName, {
                  type: data.photoType,
                });
                setPhotoFile(file);
              });
          }
        }
        // clear both possible keys after restore
        sessionStorage.removeItem("animalReportFormData");
        sessionStorage.removeItem("animalProfileFormData");
      } catch (error) {
        console.error("Failed to restore form data:", error);
      }
    }
  }, []);

  // Fetch current user and verify admin privileges for sidebar display
  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (error || !user) {
          router.replace("/admin/login");
          return;
        }

        setUserEmail(user.email || "");
        const nameFromMeta = (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || "";
        setUserName(nameFromMeta || user.email?.split("@")[0] || "");

        // Verify admin table contains this user
        const { data: adminData, error: adminError } = await supabase
          .from("admin")
          .select("auth_id")
          .eq("auth_id", user.id)
          .single();

        if (!mounted) return;

        if (adminError || !adminData) {
          router.replace("/admin/login");
          return;
        }
      } catch (e) {
        console.error("Admin check failed:", e);
        if (mounted) router.replace("/admin/login");
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

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

    if (lat == null || lng == null) {
      setResultMsg("Please capture location before proceeding.");
      return;
    }

    const formData: any = {
      // camelCase for UI code
      recorderName,
      animalName,
      animalType,
      breed,
      gender,
      dateSeen,
      physicalDescription,
      vaccinationStatus,
      animalStatus,
      otherInfo,
      area,
      landmark,
      road,
      theme,
      hasHealthIssues,
      healthDetails,
      hasCollar,
      collarDetails,
      lat,
      lng,
      photoPreview: preview,
      // snake_case for server compatibility and confirm page
      recorder_name: recorderName,
      animal_name: animalName,
      animal_type: animalType,
      animal_breed: breed,
      animal_gender: gender,
      date_seen: dateSeen,
      animal_description: physicalDescription,
      vaccination_status: vaccinationStatus,
      animal_status: animalStatus,
      other_information: otherInfo,
      latitude: lat,
      longitude: lng,
    };

    if (photoFile) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(photoFile);
        });
        const base64 = await base64Promise;
        formData.photoBase64 = base64;
        formData.photoName = photoFile.name;
        formData.photoType = photoFile.type;
      } catch (error) {
        console.error("Failed to convert photo to base64:", error);
      }
    }

    // Save snapshot for both user-report and admin-profile workflows
    sessionStorage.setItem("animalReportFormData", JSON.stringify(formData));
    sessionStorage.setItem("animalProfileFormData", JSON.stringify(formData));

    // Set confirm_access cookie before redirecting to confirm page
    document.cookie = "confirm_access=true; path=/; max-age=300";

    // Build URL params with both camelCase and snake_case keys to be robust
    const params = new URLSearchParams();
    params.set("recorderName", recorderName || "");
    params.set("recorder_name", recorderName || "");
    params.set("animalName", animalName || "");
    params.set("animal_name", animalName || "");
    params.set("animalType", animalType || "");
    params.set("animal_type", animalType || "");
    params.set("gender", gender || "Unknown");
    params.set("animal_gender", gender || "Unknown");
    params.set("dateSeen", dateSeen || "");
    params.set("date_seen", dateSeen || "");
    params.set("physicalDescription", physicalDescription || "");
    params.set("animal_description", physicalDescription || "");
    params.set("breed", breed || "");
    params.set("animal_breed", breed || "");
    params.set("vaccinationStatus", vaccinationStatus || "");
    params.set("vaccination_status", vaccinationStatus || "");
    params.set("animalStatus", animalStatus || "");
    params.set("animal_status", animalStatus || "");
    params.set("area", area || "");
    params.set("landmark", landmark || "");
    params.set("road", road || "");
    params.set("healthIssues", hasHealthIssues ? healthDetails || "Yes" : "None");
    params.set("health_issues", hasHealthIssues ? healthDetails || "Yes" : "None");
    params.set("animalCollar", hasCollar ? collarDetails || "Has collar" : "None");
    params.set("animal_collar", hasCollar ? collarDetails || "Has collar" : "None");
    params.set("otherInfo", otherInfo || "None");
    params.set("other_information", otherInfo || "None");
    params.set("theme", theme);
    params.set("animal_theme", theme);
    params.set("lat", (lat ?? "").toString());
    params.set("latitude", (lat ?? "").toString());
    params.set("lng", (lng ?? "").toString());
    params.set("longitude", (lng ?? "").toString());
    params.set("photoUrl", preview || "");
    params.set("photo_url", preview || "");

    router.push(`/admin/profiles/animal/confirm?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#E6E6E6] ">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        userEmail={userEmail}
        router={router}
      />
      <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
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

      <section className="max-w-6xl mx-auto px-4 py-6 pl-[24px] pr-[24px]">
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
            Add Animal Form
          </h1>

          <p
            className="text-xs sm:text-sm md:text-md"
            style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
          >
            Fill up the details in the form to catalog another animal
          </p>
        </div>

        <div className="rounded-xl bg-[#E1E69D] border-[#3C3333] backdrop-blur-sm p-5 flex flex-wrap justify-center items-start content-start gap-[15px] md:gap-[15px] lg:gap-[20px] border-1 border-[#3C3333] self-stretch">
          <div className="w-full flex flex-wrap items-stretch gap-[15px] lg:gap-[20px]">
            {/* Picture panel */}
            <div className="w-full lg:w-[340px] rounded-xl bg-[#E6E6E6] p-2 flex flex-col justify-between">
              <div
                className="w-full h-[320px] rounded-lg bg-[#E6E6E6] flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => document.getElementById("photo-input")?.click()}
                style={{ minWidth: 0 }}
              >
                {preview ? (
                  <img src={preview} alt="Animal photo" className="w-full h-full object-cover" />
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
                        color: "#000",
                        fontFamily: '"Genty Sans", sans-serif',
                        fontSize: "16px",
                        fontWeight: 400,
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
                accept="image/jpeg,image/png,image/svg+xml"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setPreview(null);
                    setPhotoFile(null);
                    // Clear photo fields from session
                    const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");
                    if (savedData) {
                      try {
                        const data = JSON.parse(savedData);
                        delete data.photoBase64;
                        delete data.photoName;
                        delete data.photoType;
                        delete data.photoPreview;
                        sessionStorage.setItem("animalProfileFormData", JSON.stringify(data));
                        sessionStorage.setItem("animalReportFormData", JSON.stringify(data));
                      } catch {}
                    }
                    return;
                  }
                  const allowed = ["image/jpeg", "image/png", "image/svg+xml"]; 
                  if (!allowed.includes(file.type)) {
                    setResultMsg("Please upload a JPG, JPEG, PNG, or SVG file.");
                    e.currentTarget.value = "";
                    return;
                  }
                  const url = URL.createObjectURL(file);
                  setPreview(url);
                  setPhotoFile(file);
                  // Read file as base64 and save to session
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    // Build snapshot with all current fields
                    const formData: any = {
                      recorderName,
                      animalName,
                      animalType,
                      breed,
                      gender,
                      dateSeen,
                      physicalDescription,
                      vaccinationStatus,
                      animalStatus,
                      otherInfo,
                      area,
                      landmark,
                      road,
                      theme,
                      hasHealthIssues,
                      healthDetails,
                      hasCollar,
                      collarDetails,
                      lat,
                      lng,
                      photoPreview: url,
                      photoBase64: base64,
                      photoName: file.name,
                      photoType: file.type,
                      // snake_case for server compatibility and confirm page
                      recorder_name: recorderName,
                      animal_name: animalName,
                      animal_type: animalType,
                      animal_breed: breed,
                      animal_gender: gender,
                      date_seen: dateSeen,
                      animal_description: physicalDescription,
                      vaccination_status: vaccinationStatus,
                      animal_status: animalStatus,
                      other_information: otherInfo,
                      latitude: lat,
                      longitude: lng,
                    };
                    sessionStorage.setItem("animalProfileFormData", JSON.stringify(formData));
                    sessionStorage.setItem("animalReportFormData", JSON.stringify(formData));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <p className="mt-3 text-xs text-[#000]">
                Tap to upload (optional)
              </p>
            </div>

            {/* Fields panel */}
            <div className="flex-1 min-w-[327px] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Recorder Name"
                  placeholder="Your name"
                    value={recorderName}
                    onChange={(e) => setRecorderName(e.target.value)}
                    name="recorder_name"
                    id="recorder_name"
                />
                <Field
                  label="Animal Name (Optional)"
                  placeholder="Animal's name"
                    value={animalName}
                    onChange={(e) => setAnimalName(e.target.value)}
                    name="animal_name"
                    id="animal_name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Type of animal"
                  placeholder="Dog, Cat, etc."
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value)}
                    name="animal_type"
                    id="animal_type"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Gender"
                    options={["Unknown", "Male", "Female"]}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      name="animal_gender"
                      id="animal_gender"
                  />
                  <Field
                    label="Date Seen"
                    type="date"
                      value={dateSeen}
                      onChange={(e) => setDateSeen(e.target.value)}
                      name="date_seen"
                      id="date_seen"
                  />
                </div>
              </div>
              {/* Breed and Vaccination Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Breed"
                  placeholder="e.g. Labrador"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  name="animal_breed"
                  id="animal_breed"
                />
                <SelectField
                  label="Vaccination Status"
                  options={["","Fully Vaccinated","Partially Vaccinated","Not Vaccinated","Vaccination In Progress","Overdue for Vaccination","Unknown"]}
                  value={vaccinationStatus}
                  onChange={(e) => setVaccinationStatus(e.target.value)}
                  name="vaccination_status"
                  id="vaccination_status"
                />
              </div>
                <TextArea
                  label="Physical Description"
                  placeholder="Color, size, markings, etc."
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  name="animal_description"
                  id="animal_description"
                />
            </div>
          </div>

          {/* Location */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
            <Field
              label="Area Seen (Location)"
              placeholder="General area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              name="area"
              id="area"
            />
            <Field
              label="Landmark Near Location"
              placeholder="Known landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              name="landmark"
              id="landmark"
            />
            <Field
              label="What Road?"
              placeholder="Street / road name"
              value={road}
              onChange={(e) => setRoad(e.target.value)}
              name="road"
              id="road"
            />
          </div>

          {/* Map */}
          <div className="w-full rounded-xl bg-[#E1E69D] p-4">
            <div className="rounded-lg h-72 md:h-80 bg-[#E1E69D] overflow-hidden relative">
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
              <button
                type="button"
                onClick={() => {
                  // Reset to UP Oblation default coordinates
                  setLat(7.0858);
                  setLng(125.4853);
                  setResultMsg(null);
                }}
                className="absolute bottom-12 right-3 px-3 py-1.5 rounded-md bg-[#8D52A7] text-white text-xs hover:bg-[#7B4692] shadow z-50"
              >
                Return to UP Oblation
              </button>
            </div>
          </div>

          {/* Health & Collar */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[10px] md:gap-[15px] lg:gap-[20px]">
            {/* Health Issues */}
            <div className="rounded-xl bg-[#E1E69D] p-4">
              <label
                className="block mb-2"
                style={{
                  color: "#3C3333",
                  fontFamily: '"Genty Sans", sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "14px",
                }}
              >
                Health Issues?
              </label>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="health"
                    className="accent-[#8D52A7] outline-none"
                    checked={!hasHealthIssues}
                    onChange={() => setHasHealthIssues(false)}
                  />
                  No
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="health"
                    className="accent-[#8D52A7] outline-none"
                    checked={hasHealthIssues}
                    onChange={() => setHasHealthIssues(true)}
                  />
                  Yes
                </label>
                {hasHealthIssues && (
                  <input
                    className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
                    style={{ backgroundColor: "#C2C876" }}
                    placeholder="Describe"
                    value={healthDetails}
                    onChange={(e) => setHealthDetails(e.target.value)}
                    name="health_issues"
                    id="health_issues"
                  />
                )}
              </div>
            </div>

            {/* Collar */}
            <div className="rounded-xl bg-[#E1E69D] p-4">
              <label
                className="block mb-2"
                style={{
                  color: "#3C3333",
                  fontFamily: '"Genty Sans", sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "14px",
                }}
              >
                Has Collar?
              </label>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="collar"
                    className="accent-[#8D52A7] outline-none"
                    checked={!hasCollar}
                    onChange={() => setHasCollar(false)}
                  />
                  No
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="collar"
                    className="accent-[#8D52A7] outline-none"
                    checked={hasCollar}
                    onChange={() => setHasCollar(true)}
                  />
                  Yes
                </label>
                {hasCollar && (
                  <input
                    className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
                    style={{ backgroundColor: "#C2C876" }}
                    placeholder="Describe"
                    value={collarDetails}
                    onChange={(e) => setCollarDetails(e.target.value)}
                    name="animal_collar"
                    id="animal_collar"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Animal Status */}
          <div className="w-full">
            <SelectField
              label="Animal Status"
              options={["Unknown", "Available for Adoption", "Adopted", "In Campus", "Under Treatment", "Lost/Missing"]}
              value={animalStatus}
              onChange={(e) => setAnimalStatus(e.target.value)}
              name="animal_status"
              id="animal_status"
            />
          </div>

          <div className="w-full">
            <TextArea
              label="Any Other Information"
              placeholder="Any additional details..."
              value={otherInfo}
              onChange={(e) => setOtherInfo(e.target.value)}
              name="other_information"
              id="other_information"
            />
          </div>

          {/* Theme */}
          <div className="w-full rounded-xl bg-[#E1E69D] p-4">
            <label
              className="block text-sm font-medium mb-3 "
              style={{
                color: "#3C3333",
                fontFamily: '"Genty Sans", sans-serif',
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "14px",
              }}
            >
              Theme
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: "blue" as ReportTheme, color: "bg-[#5E9BBA]" },
                { key: "green" as ReportTheme, color: "bg-[#689668]" },
                { key: "orange" as ReportTheme, color: "bg-[#DCB57E]" },
                { key: "pink" as ReportTheme, color: "bg-[#C575AD]" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTheme(t.key)}
                  aria-label={`${t.key} theme`}
                  className={`h-10 rounded-md ${
                    t.color
                  } transition outline outline-2 ${
                    theme === t.key ? "outline-[#3C3333]" : "outline-transparent"
                  } hover:brightness-110`}
                />
              ))}
              {/* hidden input to submit theme as snake_case name */}
              <input type="hidden" name="animal_theme" value={theme} />
            </div>
          </div>

          {/* Submit */}
          <div className="w-full">
            <button
              onClick={handleConfirm}
              type="button"
              className="w-full rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692]"
            >
              Confirm Report
            </button>
            {resultMsg && (
              <p className="mt-2 text-xs text-gray-800 text-center">
                {resultMsg}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, placeholder, type = "text", value, onChange, name, id }: FieldProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-2">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
        }}
        htmlFor={id}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...(name ? { name } : {})}
        {...(id ? { id } : {})}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#3C3333]"
        style={{ backgroundColor: "#C2C876" }}
      />
    </div>
  );
}

function SelectField({ label, options, value, onChange, name, id }: SelectFieldProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-2">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
        }}
        htmlFor={id}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        {...(name ? { name } : {})}
        {...(id ? { id } : {})}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#3C3333]"
        style={{ backgroundColor: "#C2C876" }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange, name, id }: TextAreaProps) {
  return (
    <div className="rounded-xl bg-[#E1E69D] p-2">
      <label
        className="block mb-1"
        style={{
          color: "#3C3333",
          fontFamily: '"Genty Sans", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "14px",
        }}
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...(name ? { name } : {})}
        {...(id ? { id } : {})}
        className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#3C3333]"
        style={{ backgroundColor: "#C2C876" }}
      />
    </div>
  );
}