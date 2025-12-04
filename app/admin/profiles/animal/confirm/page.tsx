// NOTE: This is only a prompted confirmation page used to test backend, not yet the final version

"use client";

// Import necessary modules
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createAnimalProfile } from "@/actions/profiles/admin";

// Dynamically import AdminMapView with no SSR
const AdminMapView = dynamic(() => import("@/components/AdminMapView"), { ssr: false });

function ConfirmationContent() {
	// Get URL search params and router
	const searchParams = useSearchParams();
	const router = useRouter();

	// Local state
	const [submitting, setSubmitting] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [showImageModal, setShowImageModal] = useState(false);

	// Extract all data from URL params (accept camelCase and snake_case)
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

	// Restore photo File from sessionStorage on mount (try admin profile key first)
	useEffect(() => {
		const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");

		if (!savedData) return;

		try {
			const data = JSON.parse(savedData);

			// Prefer a base64 payload if available
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

			// If there's a preview URL (blob: or object URL or public URL), try to fetch it
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

	// Map theme name to a visible color
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


	async function handleConfirmSubmit() {
		// Submit the report
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
			let savedPhotoBase64: string | undefined = undefined;
			let sendBase64: string | undefined = undefined;
			try {
				const savedData = sessionStorage.getItem("animalProfileFormData") || sessionStorage.getItem("animalReportFormData");
				if (savedData) {
					const data = JSON.parse(savedData);
					if (data.photoBase64 && data.photoName && data.photoType) {
						savedPhotoBase64 = data.photoBase64;
						// Always prefer base64 for upload if File cannot be reconstructed
						if (!fileToSend) sendBase64 = data.photoBase64;
						if (!fileToSend) {
							const res = await fetch(data.photoBase64);
							const blob = await res.blob();
							fileToSend = new File([blob], data.photoName, { type: data.photoType });
						}
						// Debug: print base64 length and sample
						console.log("[confirm] photoBase64 length:", data.photoBase64.length);
						console.log("[confirm] photoBase64 sample:", data.photoBase64.slice(0, 120));
					} else {
						console.log("[confirm] photoBase64 missing or incomplete", { photoBase64: data.photoBase64, photoName: data.photoName, photoType: data.photoType });
					}
				} else {
					console.log("[confirm] no savedData in sessionStorage");
				}
			} catch (err) {
				console.error("Error restoring photo before submit:", err);
			}

			// Debug: log the file/base64 we're about to send
			if (fileToSend) {
				console.log("[confirm] sending file:", { name: fileToSend.name, type: fileToSend.type, size: fileToSend.size });
			} else if (sendBase64) {
				console.log("[confirm] sending base64:", sendBase64.slice(0, 80));
			} else {
				console.log("[confirm] no file or base64 to send");
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

		// Handle submission result
		if (!res.success) {
				setResultMsg(res.error ?? "Failed to submit");
			} else {
				setResultMsg("Report submitted successfully!");
				// Clear the saved snapshot now that submission succeeded (both keys)
				sessionStorage.removeItem("animalReportFormData");
				sessionStorage.removeItem("animalProfileFormData");
				// Redirect to home after 2 seconds
				setTimeout(() => router.push("/admin/profiles"), 2000);
			}
		} catch (e: any) {
			setResultMsg(e.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-[#E6E6E6]">
			{/* Image Modal */}
			{showImageModal && photoUrl && (
				<div
					className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
					onClick={() => setShowImageModal(false)}
				>
					<div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
						<img
							src={photoUrl}
							alt="Animal photo full view"
							className="max-w-full max-h-full object-contain"
						/>
						<button
							onClick={() => setShowImageModal(false)}
							className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					</div>
				</div>
			)}
			{/* Header matching user form */}
			<header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
				<div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
					<button 
						type="button" 
						className="p-2 hover:bg-gray-100 rounded-lg transition" 
						aria-label="Menu"
						onClick={() => router.push("/admin/profiles/animal")}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</button>
					<div className="flex-1 flex justify-center items-center h-full">
						<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} className="flex-shrink-0" />
					</div>
					<button
						onClick={() => router.push("/admin")}
						className="p-2 hover:bg-gray-100 rounded-lg transition"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
							<polyline points="10 17 15 12 10 7"></polyline>
							<line x1="15" y1="12" x2="3" y2="12"></line>
						</svg>
					</button>
				</div>
			</header>

			<section className="max-w-6xl mx-auto px-4 py-6">
				<div className="mb-6">
					<h1
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
						Confirm Your Animal Profile
					</h1>
					<p
						className="text-xs sm:text-sm md:text-md"
						style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
					>
						Review the animal profile details before submitting
					</p>
				</div>

				<div 
					className="rounded-xl p-6"
					style={{
						display: 'flex',
						minWidth: '327px',
						padding: '20px',
						flexDirection: 'column',
						gap: '15px',
						alignSelf: 'stretch',
						border: '1px solid #3C3333',
						backgroundColor: getThemeColor(animalTheme),
					}}
				>
					{/* Top two-column: picture left, fields right */}
					<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
						{/* Picture panel */}
						<div className="rounded-xl p-4 flex flex-col">
							<div 
								className="w-full h-[300px] rounded-lg bg-white flex items-center justify-center overflow-hidden cursor-pointer transition relative group border-2 border-[#3C3333]"
								onClick={() => photoUrl && setShowImageModal(true)}
							>
								{photoUrl ? (
									<>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={photoUrl} alt="Animal photo" className="w-full h-full object-cover" />
										<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<span className="text-white text-sm font-semibold">Click to View Photo</span>
										</div>
									</>
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
							<p className="mt-3 text-xs" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Photo Preview {photoUrl && "(Click to enlarge)"}</p>
						</div>

						{/* Fields panel - Read-only display */}
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
							{/* Breed & Vaccination (match form ordering) */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<DisplayField label="Breed" value={breed || "—"} />
								<DisplayField label="Vaccination Status" value={vaccinationStatus || "—"} />
							</div>
							<DisplayTextArea label="Physical Description" value={physicalDescription || "—"} />
						</div>
					</div>

					{/* Location fields */}
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
						<DisplayField label="Area Seen (Location)" value={area || "—"} />
						<DisplayField label="Landmark Near Location" value={landmark || "—"} />
						<DisplayField label="What Road?" value={road || "—"} />
					</div>

					{/* Map display */}
					{lat && lng && (
						<div className="rounded-xl p-4 mt-2">
							<label 
								className="block mb-2" 
								style={{
									color: '#3C3333',
									fontFamily: '"Genty Sans", sans-serif',
									fontSize: '13px',
									fontWeight: 600,
									textTransform: 'uppercase' as const,
									letterSpacing: '0.5px',
								}}
							>
								Location on Map
							</label>
							<div className="rounded-lg h-72 md:h-80 bg-[#E1E69D] overflow-hidden">
								<AdminMapView latitude={lat} longitude={lng} />
							</div>
						</div>
					)}

					{/* Health, Collar & Status */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<DisplayField label="Health Issues" value={healthIssues || "None"} />
						<DisplayField label="Collar" value={animalCollar || "None"} />
					</div>
					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
						<DisplayField label="Animal Status" value={animalStatus || "—"} />
					</div>

					{/* Other Info */}
					<DisplayTextArea label="Any Other Information" value={otherInfo || "None"} />

					{/* Theme removed from confirmation display */}

					{/* Action buttons */}
					<div className="pt-4 flex gap-3">
						<button
							onClick={() => router.push('/admin/profiles/animal')}
							className="flex-1 rounded-lg py-3 text-sm font-semibold transition"
							style={{ 
								backgroundColor: '#E6E6E6', 
								color: '#3C3333', 
								fontFamily: '"Genty Sans", sans-serif',
								border: '1px solid #3C3333'
							}}
						>
							Edit Profile
						</button>
						<button
							onClick={handleConfirmSubmit}
							disabled={submitting}
							className="flex-1 rounded-lg py-3 text-sm font-semibold transition disabled:opacity-50"
							style={{ 
								backgroundColor: '#8D52A7', 
								color: 'white', 
								fontFamily: '"Genty Sans", sans-serif' 
							}}
						>
							{submitting ? 'Submitting...' : 'Confirm & Submit'}
						</button>
					</div>
					{resultMsg && <p className="mt-2 text-sm text-center font-medium" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>{resultMsg}</p>}
				</div>

			</section>
		</main>
	);
}

function DisplayField({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl p-4">
			<label 
				className="block mb-2" 
				style={{
					color: '#3C3333',
					fontFamily: '"Genty Sans", sans-serif',
					fontSize: '13px',
					fontWeight: 600,
					textTransform: 'uppercase' as const,
					letterSpacing: '0.5px',
				}}
			>
				{label}
			</label>
			<p className="text-base" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif', fontWeight: 400 }}>{value}</p>
		</div>
	);
}

function DisplayTextArea({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl p-4">
			<label 
				className="block mb-2" 
				style={{
					color: '#3C3333',
					fontFamily: '"Genty Sans", sans-serif',
					fontSize: '13px',
					fontWeight: 600,
					textTransform: 'uppercase' as const,
					letterSpacing: '0.5px',
				}}
			>
				{label}
			</label>
			<p className="text-base whitespace-pre-wrap" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif', fontWeight: 400 }}>{value}</p>
		</div>
	);
}

export default function ConfirmPage() {
	return (
		<Suspense fallback={
			<main className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
				<p className="text-sm">Loading confirmation...</p>
			</main>
		}>
			<ConfirmationContent />
		</Suspense>
	);
}
