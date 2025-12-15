// NOTE: This is only a prompted confirmation page used to test backend, not yet the final version

"use client";

// Import necessary modules
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createAnimalReport } from "@/actions/form/user";
import { getGlobalPhotoFile } from "@/app/(user)/form/page";

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

	// Extract all data from URL params
	const reportTitle = searchParams.get("reportTitle") || "";
	const reporterName = searchParams.get("reporterName") || "";
	const animalType = searchParams.get("animalType") || "";
	const gender = searchParams.get("gender") || "Unknown";
	const dateSeen = searchParams.get("dateSeen") || "";
	const physicalDescription = searchParams.get("physicalDescription") || "";
	const area = searchParams.get("area") || "";
	const landmark = searchParams.get("landmark") || "";
	const road = searchParams.get("road") || "";
	const healthIssues = searchParams.get("healthIssues") || "";
	const animalCollar = searchParams.get("animalCollar") || "";
	const otherInfo = searchParams.get("otherInfo") || "";
	// report_theme removed from user forms; no theme handling here
	const lat = parseFloat(searchParams.get("lat") || "0");
	const lng = parseFloat(searchParams.get("lng") || "0");
	const photoUrl = searchParams.get("photoUrl") || "";

	// Restore photo File from global storage on mount
	useEffect(() => {
		const file = getGlobalPhotoFile();
		if (file) {
			setPhotoFile(file);
		}
	}, []);


	async function handleConfirmSubmit() {
		// Submit the report
		setSubmitting(true);
		setResultMsg(null);
		try {
		// Reconstruct date with time
		let dateSeenWithTime: string | undefined = undefined;
		if (dateSeen) {
			const now = new Date();
			const selectedDate = new Date(dateSeen);
			selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
			dateSeenWithTime = selectedDate.toISOString();
		}

		// Submit the report
		const res = await createAnimalReport({
			report_title: reportTitle || undefined,
			reporter_name: reporterName || undefined,
			animal_type: animalType || "other",
			animal_gender: gender as string,
			date_seen: dateSeenWithTime,
			animal_description: physicalDescription || undefined,
			area: area || undefined,
			landmark: landmark || undefined,
			road: road || undefined,
			health_issues: healthIssues || undefined,
			animal_collar: animalCollar || undefined,
			other_information: otherInfo || undefined,
			// report_theme removed
			latitude: lat,
			longitude: lng,
			photo: photoFile || undefined,
		});

		// Handle submission result
		if (!res.success) {
				setResultMsg(res.error ?? "Failed to submit");
			} else {
				setResultMsg("Report submitted successfully!");
					// Clear the saved snapshot now that submission succeeded
					sessionStorage.removeItem('animalReportFormData');
				// Redirect to home after 2 seconds
				setTimeout(() => router.push("/"), 2000);
			}
		} catch (e: any) {
			setResultMsg(e.message);
		} finally {
			setSubmitting(false);
		}
	}

	// Helper to persist photo file as base64 in sessionStorage
	function handleEditReport() {
		if (photoFile) {
			const reader = new FileReader();
			reader.onload = function (e) {
				if (e.target?.result) {
					sessionStorage.setItem('animalReportPhotoBase64', e.target.result as string);
				}
				// Save all form data as before
				sessionStorage.setItem('animalReportFormData', JSON.stringify({
					reportTitle,
					reporterName,
					animalType,
					gender,
					dateSeen,
					physicalDescription,
					otherInfo,
					area,
					landmark,
					road,
					hasHealthIssues: healthIssues !== "None",
					healthDetails: healthIssues !== "None" ? healthIssues : "",
					hasCollar: animalCollar !== "None",
					collarDetails: animalCollar !== "None" ? animalCollar : "",
					lat,
					lng,
					photoPreview: photoUrl,
				}));
				router.push('/form');
			};
			reader.readAsDataURL(photoFile);
		} else {
			// Save all form data as before
			sessionStorage.setItem('animalReportFormData', JSON.stringify({
				reportTitle,
				reporterName,
				animalType,
				gender,
				dateSeen,
				physicalDescription,
				otherInfo,
				area,
				landmark,
				road,
				hasHealthIssues: healthIssues !== "None",
				healthDetails: healthIssues !== "None" ? healthIssues : "",
				hasCollar: animalCollar !== "None",
				collarDetails: animalCollar !== "None" ? animalCollar : "",
				lat,
				lng,
				photoPreview: photoUrl,
			}));
			router.push('/form');
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
			{/* Header matching form */}
			<header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
				<div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
					<button 
						type="button" 
						className="p-2 hover:bg-gray-100 rounded-lg transition" 
						aria-label="Menu"
						onClick={() => router.push("/form")}
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
						onClick={() => router.push("/")}
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
						Confirm Your Report
					</h1>
					<p
						className="text-xs sm:text-sm md:text-md"
						style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
					>
						Review your report details before submitting
					</p>
				</div>

				<div 
					className="rounded-xl bg-[#E1E69D] p-6"
					style={{
						display: 'flex',
						minWidth: '327px',
						padding: '20px',
						flexDirection: 'column',
						gap: '15px',
						alignSelf: 'stretch',
						border: '1px solid #3C3333',
					}}
				>
					{/* Top two-column: picture left, fields right */}
					<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
						{/* Picture panel */}
						<div className="rounded-xl bg-[#E1E69D] p-4 flex flex-col">
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
						<DisplayField label="Report Title" value={reportTitle.trim() ? reportTitle : "—"} />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<DisplayField label="Reporter Name" value={reporterName.trim() ? reporterName : "—"} />
						<DisplayField label="Type of animal" value={animalType || "—"} />
					</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">

								<DisplayField label="Gender" value={gender} />
								<DisplayField label="Date Seen" value={dateSeen ? new Date(dateSeen).toLocaleDateString() : "—"} />
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
						<div className="rounded-xl bg-[#E1E69D] p-4 mt-2">
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

					{/* Health & Collar */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<DisplayField label="Health Issues" value={healthIssues || "None"} />
						<DisplayField label="Collar" value={animalCollar || "None"} />
					</div>

					{/* Other Info */}
					<DisplayTextArea label="Any Other Information" value={otherInfo || "None"} />

					{/* Theme removed from confirmation display */}

					{/* Action buttons */}
					<div className="pt-4 flex gap-3">
						<button
							onClick={handleEditReport}
							className="flex-1 rounded-md border-2 border-gray-400 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
						>
							Edit Report
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
		<div className="rounded-xl bg-[#E1E69D] p-4">
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
		<div className="rounded-xl bg-[#E1E69D] p-4">
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
