"use client";

// Imports
import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { updateAnimalProfile } from "@/actions/profiles/admin";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });


// Local theme type used by forms
type ReportTheme = "blue" | "green" | "orange" | "pink";

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

// Animal type definition
type Animal = {
	animal_id: string;
	animal_name: string | null;
	animal_species: string | null;
	animal_breed: string | null;
	animal_gender: string | null;
	animal_description: string | null;
	animal_status: string | null;
	animal_photo: string | null;
	created_at: string | null;
	animal_location?: string | null;
	vaccination_status?: string | null;
	recorder_name?: string | null;
	animal_theme?: string | null;
	date_seen?: string | null;
	area?: string | null;
	landmark?: string | null;
	road?: string | null;
	health_issues?: string | null;
	animal_collar?: string | null;
	other_information?: string | null;
};

// Storage bucket name
const BUCKET = "Animal Profile Photos" as const;

// Edit Animal Profile Page Component
export default function EditAnimalPage() {
	// Get route params and router
	const params = useParams();
	const router = useRouter();

	// Extract animal ID from params
	const id = params?.id as string | undefined;

	// Component state
	const [animal, setAnimal] = useState<Animal | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Form state
	const [recorderName, setRecorderName] = useState("");
	const [name, setName] = useState("");
	const [species, setSpecies] = useState("");
	const [breed, setBreed] = useState("");
	const [gender, setGender] = useState("Unknown");
	const [dateSeen, setDateSeen] = useState("");
	const [description, setDescription] = useState("");
	const [vaccinationStatus, setVaccinationStatus] = useState("");
	const [status, setStatus] = useState("Unknown");
	const [otherInfo, setOtherInfo] = useState("");
	const [area, setArea] = useState("");
	const [landmark, setLandmark] = useState("");
	const [road, setRoad] = useState("");
	const [theme, setTheme] = useState<ReportTheme>("blue");
	const [hasHealthIssues, setHasHealthIssues] = useState<boolean>(false);
	const [healthDetails, setHealthDetails] = useState<string>("");
	const [hasCollar, setHasCollar] = useState<boolean>(false);
	const [collarDetails, setCollarDetails] = useState<string>("");
	const [lat, setLat] = useState<number | null>(7.0858);
	const [lng, setLng] = useState<number | null>(125.4853);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitMsg, setSubmitMsg] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// State for user info
	const [userName, setUserName] = useState<string>("");
	const [userEmail, setUserEmail] = useState<string>("");

	// Fetch animal data
	useEffect(() => {
		// Check for valid ID
		if (!id) return;
		let active = true;

		// Fetch one animal by ID
		const fetchOne = async () => {
			// Start loading and clear previous errors
			setLoading(true);
			setError(null);

			// Query Supabase for the animal profile
			const { data, error } = await supabase
				.from("animal")
				.select("*")
				.eq("animal_id", id)
				.maybeSingle();

			// Handle response
			if (!active) return;

			// Set data or error state
			if (error) {
				setError(error.message);
				setAnimal(null);
			} 
			
			// Set data state and pre-populate form
			else if (data) {
				const animalData = data as Animal;
				setAnimal(animalData);
				setRecorderName((animalData as any).recorder_name || (animalData as any).recorderName || "");
				setName(animalData.animal_name || "");
				setSpecies(animalData.animal_species || "");
				setBreed(animalData.animal_breed || "");
				setVaccinationStatus(animalData.vaccination_status || "");
				setStatus(animalData.animal_status || "Unknown");
				setGender(animalData.animal_gender || "Unknown");
				setDateSeen((animalData as any).date_seen || (animalData as any).dateSeen || "");
				setDescription(animalData.animal_description || "");
				setOtherInfo((animalData as any).other_information || (animalData as any).otherInformation || "");
				setArea((animalData as any).area || "");
				setLandmark((animalData as any).landmark || "");
				setRoad((animalData as any).road || "");
				setTheme(((animalData as any).animal_theme as ReportTheme) || (animalData as any).animalTheme || "blue");
				const healthIssuesVal = (animalData as any).health_issues || (animalData as any).healthIssues || "";
				setHasHealthIssues(!!healthIssuesVal && healthIssuesVal !== "None");
				setHealthDetails(healthIssuesVal === "None" ? "" : healthIssuesVal);
				const collarVal = (animalData as any).animal_collar || (animalData as any).animalCollar || "";
				setHasCollar(!!collarVal && collarVal !== "None");
				setCollarDetails(collarVal === "None" ? "" : collarVal);
				setLat((animalData as any).latitude ?? 7.0858);
				setLng((animalData as any).longitude ?? 125.4853);
				setPhotoPreview(animalData.animal_photo || null);
			}

			// Finalize loading state
			setLoading(false);
		};

		// Invoke the fetch function
		fetchOne();
		return () => {
			active = false;
		};
	}, [id]);

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
			setSubmitMsg("Geolocation unsupported.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLat(pos.coords.latitude);
				setLng(pos.coords.longitude);
			},
			(err) => setSubmitMsg(`Location error: ${err.message}`),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}

	function handleMapClick(newLat: number, newLng: number) {
		setLat(newLat);
		setLng(newLng);
		setSubmitMsg(null);
	}
	
	// Handle photo file selection (kept from original edit page)
	const handlePhotoChange = (file: File | null) => {
		// Update photo file and preview
		setPhotoFile(file);
		setPhotoPreview(file ? URL.createObjectURL(file) : animal?.animal_photo || null);
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		// Prevent default form submission
		e.preventDefault();

		// Ensure valid ID
		if (!id) return;

		// Start submitting
		setSubmitting(true);
		setSubmitMsg(null);

		// Try to upload photo and update profile
		try {
			// Build payload from form state
			const res = await updateAnimalProfile({
				id,
				name,
				species,
				breed,
				description,
				status,
				gender,
				vaccinationStatus,
				photo: photoFile || undefined,
				// new fields (include both snake_case and camelCase aliases)
				recorder_name: recorderName || undefined,
				recorderName: recorderName || undefined,
				animal_theme: theme || undefined,
				animalTheme: theme || undefined,
				date_seen: dateSeen || undefined,
				dateSeen: dateSeen || undefined,
				area: area || undefined,
				landmark: landmark || undefined,
				road: road || undefined,
				latitude: lat ?? undefined,
				longitude: lng ?? undefined,
				health_issues: hasHealthIssues ? healthDetails || "Yes" : "None",
				healthIssues: hasHealthIssues ? healthDetails || "Yes" : "None",
				animal_collar: hasCollar ? collarDetails || "Has collar" : "None",
				animalCollar: hasCollar ? collarDetails || "Has collar" : "None",
				other_information: otherInfo || undefined,
				otherInformation: otherInfo || undefined,
			});

			// Handle response
			if (!res.success) {
				setSubmitMsg(res.error || 'Failed to update profile');
			} 
			
			// Success
			else {
				setSubmitMsg('Animal profile updated successfully');
				setTimeout(() => {
					router.push(`/admin/profiles/animal/${id}`);
				}, 1500);
			}
		} catch (err: any) {
			// Handle unexpected errors during submission
			setSubmitMsg(err?.message || 'Unexpected error');
		} finally {
			// Finalize submitting state
			setSubmitting(false);
		}
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
								<div className="w-10 h-10 rounded-full bg-gray-400" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-gray-800">{userName || "Admin"}</p>
									<p className="text-xs text-gray-600">{userEmail || ""}</p>
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
								{ label: "Home", icon: <div className="w-6 h-6" /> },
								{ label: "About Us", icon: <div className="w-6 h-6" /> },
								{ label: "Mission", icon: <div className="w-6 h-6" /> },
								{ label: "Vision", icon: <div className="w-6 h-6" /> },
								{ label: "Goals", icon: <div className="w-6 h-6" /> },
							].map((item) => (
								<button
									key={item.label}
									className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
									onClick={() => setSidebarOpen(false)}
								>
									{item.icon}
									<span className="font-semibold text-gray-800 text-sm">{item.label}</span>
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
								<path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
								<path d="M20.42 4.58C19.92 4.08 19.32 3.68 18.67 3.4C18.01 3.13 17.31 2.99 16.6 2.99C15.89 2.99 15.18 3.13 14.52 3.4C13.87 3.68 13.27 4.08 12.77 4.58L12 5.36L11.23 4.58C10.73 4.08 10.13 3.68 9.48 3.4C8.82 3.13 8.12 2.99 7.41 2.99C6.7 2.99 5.99 3.13 5.33 3.4C4.68 3.68 4.08 4.08 3.58 4.58C1.46 6.7 1.33 10.28 4 13L12 21L20 13C22.67 10.28 22.54 6.7 20.42 4.58Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
								<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<span className="font-semibold text-gray-800 text-sm">Task Volunteer</span>
					</button>
				</div>

				{/* Bottom Section – Social Links */}
				<div className="flex items-center gap-3 mt-6">
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
		<main className="min-h-screen bg-[#E6E6E6]">
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
						href={`/admin/profiles/animal/${id}`}
						className="p-2 hover:bg-gray-100 rounded-lg transition"
					>
						<LogIn className="w-6 h-6 text-gray-800" />
					</Link>
				</div>
			</header>

			{loading && (
				<div className="py-24 text-center text-gray-500">Loading...</div>
			)}
			{error && (
				<div className="max-w-6xl mx-auto px-4 py-4 mt-6">
					<div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
						Error: {error}
					</div>
				</div>
			)}
			{!loading && !error && !animal && (
				<div className="py-24 text-center text-gray-500">Animal not found.</div>
			)}

			{animal && (
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
							Edit Animal Profile
						</h1>

						<p
							className="text-xs sm:text-sm md:text-md"
							style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
						>
							Update the details for this animal
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="rounded-xl bg-[#E1E69D] border-[#3C3333] backdrop-blur-sm p-5 flex flex-wrap justify-center items-start content-start gap-[15px] md:gap-[15px] lg:gap-[20px] border-1 border-[#3C3333] self-stretch">
							<div className="w-full flex flex-wrap items-stretch gap-[15px] lg:gap-[20px]">
								{/* Picture panel */}
								<div className="w-full lg:w-[340px] rounded-xl bg-[#E6E6E6] p-4 flex flex-col justify-between">
									<div
										className="w-full h-[320px] rounded-lg bg-[#E6E6E6] flex items-center justify-center overflow-hidden cursor-pointer"
										onClick={() => document.getElementById("photo-input")?.click()}
										style={{ minWidth: 0 }}
									>
										{photoPreview ? (
											<img src={photoPreview} alt="Animal" className="w-full h-full object-cover" />
										) : (
											<div className="flex flex-col items-center text-gray-400 text-sm gap-2">
												<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
													<path d="M29 8H19L14 14H8C6.93913 14 5.92172 14.4214 5.17157 15.1716C4.42143 15.9217 4 16.9391 4 18V36C4 37.0609 4.42143 38.0783 5.17157 38.8284C5.92172 39.5786 6.93913 40 8 40H40C41.0609 40 42.0783 39.5786 42.8284 38.8284C43.5786 38.0783 44 37.0609 44 36V18C44 16.9391 43.5786 15.9217 42.8284 15.1716C42.0783 14.4214 41.0609 14 40 14H34L29 8Z" stroke="#3C3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
													<path d="M24 32C27.3137 32 30 29.3137 30 26C30 22.6863 27.3137 20 24 20C20.6863 20 18 22.6863 18 26C18 29.3137 20.6863 32 24 32Z" stroke="#3C3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
												setPhotoFile(null);
												setPhotoPreview(animal?.animal_photo || null);
												return;
											}
											const allowed = ["image/jpeg", "image/png", "image/svg+xml"]; 
											if (!allowed.includes(file.type)) {
												setSubmitMsg("Please upload a JPG, JPEG, PNG, or SVG file.");
												e.currentTarget.value = "";
												return;
											}
											const url = URL.createObjectURL(file);
											setPhotoPreview(url);
											setPhotoFile(file);
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
											value={name}
											onChange={(e) => setName(e.target.value)}
											name="animal_name"
											id="animal_name"
										/>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<Field
											label="Type of animal"
											placeholder="Dog, Cat, etc."
											value={species}
											onChange={(e) => setSpecies(e.target.value)}
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
												value={dateSeen?.split('T')[0] || dateSeen}
												onChange={(e) => setDateSeen(e.target.value)}
												name="date_seen"
												id="date_seen"
											/>
										</div>
									</div>
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
										value={description}
										onChange={(e) => setDescription(e.target.value)}
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
										className="absolute bottom-4 right-4 z-20 rounded-md bg-[#8D52A7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7B4692]"
									>
										Use My Location
									</button>
								</div>
							</div>

							{/* Health & Collar */}
							<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[10px] md:gap-[15px] lg:gap-[20px]">
								<div className="rounded-xl bg-[#E1E69D] p-4">
									<label className="block text-sm font-medium mb-3" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500 }}>
										Health Issues
									</label>
									<div className="flex items-center gap-3 mb-3">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="healthIssues"
												checked={!hasHealthIssues}
												onChange={() => { setHasHealthIssues(false); setHealthDetails(""); }}
												className="w-4 h-4"
											/>
											<span className="text-sm text-[#3C3333]">None</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="healthIssues"
												checked={hasHealthIssues}
												onChange={() => setHasHealthIssues(true)}
												className="w-4 h-4"
											/>
											<span className="text-sm text-[#3C3333]">Yes</span>
										</label>
									</div>
									{hasHealthIssues && (
										<textarea
											rows={3}
											placeholder="Describe health issues..."
											value={healthDetails}
											onChange={(e) => setHealthDetails(e.target.value)}
											className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
											style={{ backgroundColor: "#C2C876" }}
										/>
									)}
								</div>

								<div className="rounded-xl bg-[#E1E69D] p-4">
									<label className="block text-sm font-medium mb-3" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500 }}>
										Collar
									</label>
									<div className="flex items-center gap-3 mb-3">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="collar"
												checked={!hasCollar}
												onChange={() => { setHasCollar(false); setCollarDetails(""); }}
												className="w-4 h-4"
											/>
											<span className="text-sm text-[#3C3333]">None</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="collar"
												checked={hasCollar}
												onChange={() => setHasCollar(true)}
												className="w-4 h-4"
											/>
											<span className="text-sm text-[#3C3333]">Yes</span>
										</label>
									</div>
									{hasCollar && (
										<input
											type="text"
											placeholder="Describe collar..."
											value={collarDetails}
											onChange={(e) => setCollarDetails(e.target.value)}
											className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
											style={{ backgroundColor: "#C2C876" }}
										/>
									)}
								</div>
							</div>

							{/* Animal Status */}
							<div className="w-full">
								<SelectField
									label="Animal Status"
									options={["Unknown", "Available for Adoption", "Adopted", "In Shelter", "Under Treatment", "Lost/Missing"]}
									value={status}
									onChange={(e) => setStatus(e.target.value)}
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
									className="block text-sm font-medium mb-3"
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
									{(["blue", "green", "orange", "pink"] as ReportTheme[]).map((t) => (
										<button
											key={t}
											type="button"
											onClick={() => setTheme(t)}
											className={`h-12 rounded-lg border-2 transition ${
												theme === t ? "border-[#8D52A7] ring-2 ring-[#8D52A7]" : "border-gray-300"
											}`}
											style={{
												backgroundColor: t === "blue" ? "#5E9BBA" : t === "green" ? "#9BBF94" : t === "orange" ? "#DCB57E" : "#C575AD",
											}}
										/>
									))}
									<input type="hidden" name="animal_theme" value={theme} />
								</div>
							</div>

							{/* Submit */}
							<div className="w-full">
								<button
									type="submit"
									disabled={submitting}
									className="w-full rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692] disabled:opacity-50"
								>
									{submitting ? 'Saving Changes...' : 'Save Changes'}
								</button>
								{submitMsg && (
									<p className={`mt-2 text-sm text-center ${submitMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
										{submitMsg}
									</p>
								)}
							</div>
						</div>
					</form>
				</section>
			)}
		</main>
	);
}

function Field({ label, placeholder, type = "text", value, onChange, name, id }: FieldProps) {
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
				className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
				style={{ backgroundColor: "#C2C876" }}
			/>
		</div>
	);
}

function SelectField({ label, options, value, onChange, name, id }: SelectFieldProps) {
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
				htmlFor={id}
			>
				{label}
			</label>
			<select
				value={value}
				onChange={onChange}
				{...(name ? { name } : {})}
				{...(id ? { id } : {})}
				className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
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
				className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
				style={{ backgroundColor: "#C2C876" }}
			/>
		</div>
	);
}
