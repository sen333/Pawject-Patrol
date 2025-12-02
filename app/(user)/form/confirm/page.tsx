// NOTE: This is only a prompted confirmation page used to test backend, not yet the final version

"use client";

// Import necessary modules
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createAnimalReport } from "@/actions/form/user";

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

	// Extract all data from URL params
	const recorderName = searchParams.get("recorderName") || "";
	const animalName = searchParams.get("animalName") || "";
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

	// Restore photo File from sessionStorage on mount
	useEffect(() => {
		const savedData = sessionStorage.getItem('animalReportFormData');

		// If saved data exists, try to reconstruct the File object
		if (savedData) {
			try {
				const data = JSON.parse(savedData);
				if (data.photoBase64 && data.photoName && data.photoType) {
					fetch(data.photoBase64)
						.then(res => res.blob())
						.then(blob => {
							const file = new File([blob], data.photoName, { type: data.photoType });
							setPhotoFile(file);
						});
				}
			} catch (error) {
				console.error('Failed to restore photo:', error);
			}
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
			recorder_name: recorderName || undefined,
			animal_name: animalName || undefined,
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

	return (
		<main className="min-h-screen bg-[#E1E69D]">
			{/* Header matching form */}
			<header className="w-full h-[52px] bg-[#E6E6E6] flex items-center">
				<div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4">
					<button type="button" className="p-2 rounded hover:bg-gray-200" aria-label="Menu">
						<span className="block w-6 h-0.5 bg-gray-800 mb-1" />
						<span className="block w-6 h-0.5 bg-gray-800 mb-1" />
						<span className="block w-6 h-0.5 bg-gray-800" />
					</button>
				<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
				<button
					onClick={() => router.push("/")}
					className="px-4 py-1.5 rounded-md text-sm bg-[#8D52A7] text-white hover:bg-[#7B4692]"
				>
					Dashboard
				</button>
				</div>
			</header>

			<section className="max-w-6xl mx-auto px-4 py-6">
				<div className="mb-4">
					<button
						onClick={() => router.back()}
						className="text-sm text-purple-700 hover:underline"
					>
						← Back to Form
					</button>
				</div>

				<h1 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Your Report</h1>

				<div className="rounded-xl border border-gray-300 bg-[#E6E6E6]/40 backdrop-blur-sm p-5 md:p-6 space-y-5">
					{/* Top two-column: picture left, fields right */}
					<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
						{/* Picture panel */}
						<div className="rounded-xl bg-[#CFC9C9] p-4 flex flex-col">
							<div className="w-full h-[300px] rounded-lg bg-[#DED8D8] border border-gray-300 flex items-center justify-center overflow-hidden">
								{photoUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
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
						<div className="rounded-xl bg-[#CFC9C9] p-4 mt-6">
							<label className="block text-sm font-medium mb-2 text-gray-800">Location on Map</label>
							<div className="rounded-lg h-72 md:h-80 bg-[#DED8D8] overflow-hidden">
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
							onClick={() => router.push('/form')}
							className="flex-1 rounded-md border-2 border-gray-400 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
						>
							Edit Report
						</button>
						<button
							onClick={handleConfirmSubmit}
							disabled={submitting}
							className="flex-1 rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692] disabled:opacity-50"
						>
							{submitting ? 'Submitting...' : 'Confirm & Submit'}
						</button>
					</div>
					{resultMsg && <p className="mt-2 text-sm text-gray-800 text-center font-medium">{resultMsg}</p>}
				</div>
			</section>
		</main>
	);
}

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

export default function ConfirmPage() {
	return (
		<Suspense fallback={
			<main className="min-h-screen bg-[#E1E69D] flex items-center justify-center">
				<p className="text-sm">Loading confirmation...</p>
			</main>
		}>
			<ConfirmationContent />
		</Suspense>
	);
}
