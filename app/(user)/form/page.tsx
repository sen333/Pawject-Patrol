"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReportTheme } from "@/actions/form/user";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// Desktop-responsive sample of the mobile form UI
// - On mobile: single column (similar to provided screenshot)
// - On md/lg screens: two columns with clear grouping
export default function ReportFormSample() {
	const router = useRouter();
	const [preview, setPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [lat, setLat] = useState<number | null>(7.0858); // UP Mindanao Oblation as default
	const [lng, setLng] = useState<number | null>(125.4853);
	const [submitting, setSubmitting] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	
	// Form field states
	const [recorderName, setRecorderName] = useState("");
	const [animalName, setAnimalName] = useState("");
	const [animalType, setAnimalType] = useState("");
	const [gender, setGender] = useState("Unknown");
	const [dateSeen, setDateSeen] = useState("");
	const [physicalDescription, setPhysicalDescription] = useState("");
	const [otherInfo, setOtherInfo] = useState("");
	const [area, setArea] = useState("");
	const [landmark, setLandmark] = useState("");
	const [road, setRoad] = useState("");
	const [theme, setTheme] = useState<ReportTheme>('blue');
	const [hasHealthIssues, setHasHealthIssues] = useState<boolean>(false);
	const [healthDetails, setHealthDetails] = useState<string>("");
	const [hasCollar, setHasCollar] = useState<boolean>(false);
	const [collarDetails, setCollarDetails] = useState<string>("");

	// Restore form state from sessionStorage on mount
	useEffect(() => {
		const savedData = sessionStorage.getItem('animalReportFormData');
		if (savedData) {
			try {
				const data = JSON.parse(savedData);
				setRecorderName(data.recorderName || "");
				setAnimalName(data.animalName || "");
				setAnimalType(data.animalType || "");
				setGender(data.gender || "Unknown");
				setDateSeen(data.dateSeen || "");
				setPhysicalDescription(data.physicalDescription || "");
				setOtherInfo(data.otherInfo || "");
				setArea(data.area || "");
				setLandmark(data.landmark || "");
				setRoad(data.road || "");
				setTheme(data.theme || 'blue');
				setHasHealthIssues(data.hasHealthIssues || false);
				setHealthDetails(data.healthDetails || "");
				setHasCollar(data.hasCollar || false);
				setCollarDetails(data.collarDetails || "");
				setLat(data.lat || 7.0858);
				setLng(data.lng || 125.4853);
				if (data.photoPreview) {
					setPreview(data.photoPreview);
					// Convert base64 back to File if needed
					if (data.photoBase64 && data.photoName && data.photoType) {
						fetch(data.photoBase64)
							.then(res => res.blob())
							.then(blob => {
								const file = new File([blob], data.photoName, { type: data.photoType });
								setPhotoFile(file);
							});
					}
				}
				// Clear sessionStorage after restoring
				sessionStorage.removeItem('animalReportFormData');
			} catch (error) {
				console.error('Failed to restore form data:', error);
			}
		}
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
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
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

		// Save form state to sessionStorage
		const formData: any = {
			recorderName,
			animalName,
			animalType,
			gender,
			dateSeen,
			physicalDescription,
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
			photoPreview: preview
		};

		// Convert photo File to base64 for storage
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
				console.error('Failed to convert photo to base64:', error);
			}
		}

		sessionStorage.setItem('animalReportFormData', JSON.stringify(formData));

		// Build URL params for confirmation page
		const params = new URLSearchParams({
			recorderName: recorderName || '',
			animalName: animalName || '',
			animalType: animalType || '',
			gender: gender || 'Unknown',
			dateSeen: dateSeen || '',
			physicalDescription: physicalDescription || '',
			area: area || '',
			landmark: landmark || '',
			road: road || '',
			healthIssues: hasHealthIssues ? (healthDetails || 'Yes') : 'None',
			animalCollar: hasCollar ? (collarDetails || 'Has collar') : 'None',
			otherInfo: otherInfo || 'None',
			theme: theme,
			lat: lat.toString(),
			lng: lng.toString(),
			photoUrl: preview || ''
		});

		router.push(`/form/confirm?${params.toString()}`);
	}

	return (
		<main className="min-h-screen bg-[#E1E69D]">
			{/* Header matching screenshot */}
			<header className="w-full h-[52px] bg-[#E6E6E6] flex items-center">
				<div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4">
					<button type="button" className="p-2 rounded hover:bg-gray-200" aria-label="Menu">
						<span className="block w-6 h-0.5 bg-gray-800 mb-1" />
						<span className="block w-6 h-0.5 bg-gray-800 mb-1" />
						<span className="block w-6 h-0.5 bg-gray-800" />
					</button>
					<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
					<Link href="/" className="px-4 py-1.5 rounded-md text-sm bg-[#8D52A7] text-white hover:bg-[#7B4692]">Dashboard</Link>
				</div>
			</header>

			<section className="max-w-6xl mx-auto px-4 py-6">
				<div className="rounded-xl border border-gray-300 bg-[#E6E6E6]/40 backdrop-blur-sm p-5 md:p-6 space-y-5">
					{/* Top two-column: picture left, fields right */}
					<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
						{/* Picture panel */}
						<div className="rounded-xl bg-[#CFC9C9] p-4 flex flex-col">
							<div
								className="w-full h-[300px] rounded-lg bg-[#DED8D8] border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
								onClick={() => document.getElementById('photo-input')?.click()}
							>
								{preview ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={preview} alt="Animal photo" className="w-full h-full object-cover" />
								) : (
									<div className="flex flex-col items-center text-gray-600 text-sm gap-2">
										<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
											<circle cx="12" cy="13" r="4" />
										</svg>
										<span>Picture</span>
									</div>
								)}
							</div>
							<input
								id="photo-input"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
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
							<p className="mt-3 text-xs text-gray-700">Tap to upload (optional)</p>
						</div>

						{/* Fields panel */}
						<div className="space-y-3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<Field label="Recorder Name" placeholder="Your name" value={recorderName} onChange={(e) => setRecorderName(e.target.value)} />
								<Field label="Animal Name (Optional)" placeholder="Animal's name" value={animalName} onChange={(e) => setAnimalName(e.target.value)} />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<Field label="Type of animal" placeholder="Dog, Cat, etc." value={animalType} onChange={(e) => setAnimalType(e.target.value)} />
								<div className="grid grid-cols-2 gap-3">
									<SelectField label="Gender" options={["Unknown", "Male", "Female"]} value={gender} onChange={(e) => setGender(e.target.value)} />
									<Field label="Date Seen" type="date" value={dateSeen} onChange={(e) => setDateSeen(e.target.value)} />
								</div>
							</div>
							<TextArea label="Physical Description" placeholder="Color, size, markings, etc." value={physicalDescription} onChange={(e) => setPhysicalDescription(e.target.value)} />
						</div>
					</div>

					{/* Location fields full width BELOW picture & description */}
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
						<Field label="Area Seen (Location)" placeholder="General area" value={area} onChange={(e) => setArea(e.target.value)} />
						<Field label="Landmark Near Location" placeholder="Known landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
						<Field label="What Road?" placeholder="Street / road name" value={road} onChange={(e) => setRoad(e.target.value)} />
					</div>

					{/* Map full width */}
					<div className="rounded-xl bg-[#CFC9C9] p-4 mt-6">
						<div className="rounded-lg h-72 md:h-80 bg-[#DED8D8] overflow-hidden relative">
							<div className="absolute inset-0 z-10">
								<MapView latitude={lat!} longitude={lng!} onLocationSelect={handleMapClick} />
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

					{/* Health issues & Collar inline */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="rounded-xl bg-[#CFC9C9] p-4">
							<label className="block text-sm font-medium mb-2 text-gray-800">Health Issues?</label>
							<div className="flex flex-wrap items-center gap-4 text-sm">
								<label className="inline-flex items-center gap-1">
									<input type="radio" name="health" className="accent-[#8D52A7]" checked={!hasHealthIssues} onChange={() => setHasHealthIssues(false)} /> No
								</label>
								<label className="inline-flex items-center gap-1">
									<input type="radio" name="health" className="accent-[#8D52A7]" checked={hasHealthIssues} onChange={() => setHasHealthIssues(true)} /> Yes
								</label>
								{hasHealthIssues && (
									<input
										className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
										placeholder="Describe issues"
										value={healthDetails}
										onChange={(e) => setHealthDetails(e.target.value)}
									/>
								)}
							</div>
						</div>
						<div className="rounded-xl bg-[#CFC9C9] p-4">
							<label className="block text-sm font-medium mb-2 text-gray-800">Has Collar?</label>
							<div className="flex flex-wrap items-center gap-4 text-sm">
								<label className="inline-flex items-center gap-1">
									<input type="radio" name="collar" className="accent-[#8D52A7]" checked={!hasCollar} onChange={() => setHasCollar(false)} /> No
								</label>
								<label className="inline-flex items-center gap-1">
									<input type="radio" name="collar" className="accent-[#8D52A7]" checked={hasCollar} onChange={() => setHasCollar(true)} /> Yes
								</label>
								{hasCollar && (
									<input
										className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
										placeholder="Describe collar"
										value={collarDetails}
										onChange={(e) => setCollarDetails(e.target.value)}
									/>
								)}
							</div>
						</div>
					</div>

					{/* Other Information */}
					<TextArea label="Any Other Information" placeholder="Any additional details..." value={otherInfo} onChange={(e) => setOtherInfo(e.target.value)} />

					{/* Theme selection */}
					<div className="rounded-xl bg-[#CFC9C9] p-4">
						<label className="block text-sm font-medium mb-3 text-gray-800">Theme</label>
						<div className="grid grid-cols-4 gap-3">
							{[
								{ key: 'blue' as ReportTheme, color: 'bg-[#5E9BBA]' },
								{ key: 'green' as ReportTheme, color: 'bg-[#689668]' },
								{ key: 'orange' as ReportTheme, color: 'bg-[#DCB57E]' },
								{ key: 'purple' as ReportTheme, color: 'bg-[#C575AD]' }
							].map(t => (
								<button
									key={t.key}
									type="button"
									onClick={() => setTheme(t.key)}
									aria-label={`${t.key} theme`}
									className={`h-10 rounded-md ${t.color} transition outline outline-2 ${theme === t.key ? 'outline-black' : 'outline-transparent'} hover:brightness-110`}
								/>
							))}
						</div>
					</div>

					{/* Submit */}
					<div className="pt-2">
						<button
							onClick={handleConfirm}
							type="button"
							className="w-full rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692]"
						>
							Confirm Report
						</button>
						{resultMsg && <p className="mt-2 text-xs text-gray-800 text-center">{resultMsg}</p>}
					</div>
				</div>
			</section>
		</main>
	);
}

function Field({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder?: string; type?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
			<label className="block text-sm font-medium text-[#3C3333] mb-2">{label}</label>
			<input
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#3C3333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
			/>
		</div>
	);
}

function SelectField({ label, options, value, onChange }: { label: string; options: string[]; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
			<label className="block text-sm font-medium text-[#3C3333] mb-2">{label}</label>
			<select 
				className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
				value={value}
				onChange={onChange}
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

function TextArea({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
			<label className="block text-sm font-medium text-[#3C3333] mb-2">{label}</label>
			<textarea
				rows={4}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#3C3333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
			/>
		</div>
	);
}

