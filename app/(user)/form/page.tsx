"use client";

import { useState } from "react";
import { createAnimalReport } from "@/actions/form/user";
import Image from "next/image";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// Desktop-responsive sample of the mobile form UI
// - On mobile: single column (similar to provided screenshot)
// - On md/lg screens: two columns with clear grouping
export default function ReportFormSample() {
	const [preview, setPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [lat, setLat] = useState<number | null>(7.0644); // Davao City center
	const [lng, setLng] = useState<number | null>(125.6079);
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
	const [theme, setTheme] = useState("");
	const [hasHealthIssues, setHasHealthIssues] = useState<boolean>(false);
	const [healthDetails, setHealthDetails] = useState<string>("");
	const [hasCollar, setHasCollar] = useState<boolean>(false);
	const [collarDetails, setCollarDetails] = useState<string>("");

	function grabCurrentLocation() {
		if (!navigator.geolocation) {
			setResultMsg("Geolocation unsupported.");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLat(pos.coords.latitude);
				setLng(pos.coords.longitude);
				const accuracy = pos.coords.accuracy;
				setResultMsg(`Location captured (±${accuracy.toFixed(0)}m accuracy)`);
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

	async function handleSubmit() {
		setSubmitting(true);
		setResultMsg(null);
		try {
			if (lat == null || lng == null) {
				setResultMsg("Please capture location before submitting.");
				setSubmitting(false);
				return;
			}
			const res = await createAnimalReport({
				recorder_name: recorderName || undefined,
				animal_name: animalName || undefined,
				animal_type: animalType || "other",
				animal_gender: gender.toLowerCase() as "unknown" | "male" | "female",
				date_seen: dateSeen || undefined,
				animal_description: physicalDescription || undefined,
				area: area || undefined,
				landmark: landmark || undefined,
				road: road || undefined,
				latitude: lat,
				longitude: lng,
				photo: photoFile ?? undefined,
			});
			if (!res.success) setResultMsg(res.error ?? "Failed to submit");
			else setResultMsg("Report submitted!");
		} catch (e: any) {
			setResultMsg(e.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-[#FFF7D6]">
			{/* Top bar */}
			<header className="sticky top-0 z-10 w-full bg-[#E6E6E6]/80 backdrop-blur border-b">
				<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="inline-block w-6 h-0.5 bg-gray-700 rounded" />
						<span className="inline-block w-6 h-0.5 bg-gray-700 rounded" />
						<span className="inline-block w-6 h-0.5 bg-gray-700 rounded" />
					</div>
					<Image src="/Moodboard2.png" alt="Pawject Patrol" width={90} height={36} />
					<div className="text-gray-700 text-sm">Sample Desktop View</div>
				</div>
			</header>

			<section className="mx-auto max-w-6xl px-4 py-6">
				<div className="rounded-2xl bg-white/80 shadow-lg p-4 md:p-6">
					<h1 className="text-xl md:text-2xl font-semibold text-[#3C3333] mb-4">Animal Report</h1>

					{/* Grid switches to two columns on desktop */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
						{/* Left column */}
						<div className="space-y-4">
							{/* Picture */}
							<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
								<label className="block text-sm font-medium text-[#3C3333] mb-2">Picture</label>
								<div className="flex items-center gap-4">
									<div className="w-28 h-28 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
										{preview ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={preview} alt="Preview" className="w-full h-full object-cover" />
										) : (
											<div className="text-gray-400 text-sm flex flex-col items-center">
												<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
													<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"></path>
													<circle cx="12" cy="13" r="4"></circle>
												</svg>
												<span>Preview</span>
											</div>
										)}
									</div>
									<div>
										<input
											type="file"
											accept="image/*"
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
											className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#8D52A7] file:px-4 file:py-2 file:text-white hover:file:bg-[#7B4692]"
										/>
										<p className="mt-1 text-xs text-gray-500">Upload a clear photo of the animal (optional).</p>
									</div>
								</div>
							</div>

							{/* Recorder & animal */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Field label="Recorder Name" placeholder="Your full name" value={recorderName} onChange={(e) => setRecorderName(e.target.value)} />
								<Field label="Animal Name (Optional)" placeholder="e.g., Ginger" value={animalName} onChange={(e) => setAnimalName(e.target.value)} />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Field label="Type of Animal" placeholder="e.g., Cat, Dog, Bird" value={animalType} onChange={(e) => setAnimalType(e.target.value)} />
								<div className="grid grid-cols-2 gap-4">
									<SelectField label="Gender" options={["Unknown", "Male", "Female"]} value={gender} onChange={(e) => setGender(e.target.value)} />
									<Field label="Date Seen" type="date" value={dateSeen} onChange={(e) => setDateSeen(e.target.value)} />
								</div>
							</div>

							<TextArea label="Physical Description" placeholder="Color, size, markings, collar, behavior, etc." value={physicalDescription} onChange={(e) => setPhysicalDescription(e.target.value)} />
							
			{/* Extended to 6 rows */}
							<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
								<label className="block text-sm font-medium text-[#3C3333] mb-2">Any Other Information</label>
								<textarea
									rows={6}
									placeholder="Additional details you'd like to add"
									value={otherInfo}
									onChange={(e) => setOtherInfo(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#3C3333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
								/>
							</div>
						</div>

						{/* Right column */}
						<div className="space-y-4">
							{/* Location */}
							<Field label="Area Seen (Location)" placeholder="Barangay / Street / Area" value={area} onChange={(e) => setArea(e.target.value)} />
							<Field label="Landmark Near Location" placeholder="e.g., 7-Eleven, park, school" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
							<Field label="What Road?" placeholder="e.g., Matina Pangi Rd" value={road} onChange={(e) => setRoad(e.target.value)} />
							
							{/* Map section */}
							<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
								<label className="block text-sm font-medium text-[#3C3333] mb-2">Map Pin/Locator</label>
								<p className="text-xs text-gray-600 mb-2">Click on the map to select a location or use your current location</p>
								<div className="h-96 rounded-lg bg-white border border-gray-200 overflow-hidden relative">
									<MapView latitude={lat!} longitude={lng!} onLocationSelect={handleMapClick} />
									<button
										onClick={grabCurrentLocation}
										type="button"
										className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-[#8D52A7] text-white text-xs hover:bg-[#7B4692] shadow-md z-[1000]"
									>
										Use My Location
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Theme and Health Issues - Side by side */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5">
						<TextArea label="Theme" placeholder="e.g., Stray rescue, injured animal, adoption inquiry" value={theme} onChange={(e) => setTheme(e.target.value)} />
						
						{/* Health / options */}
						<div className="rounded-xl border border-gray-200 bg-[#F4F1E3] p-4">
							<label className="block text-sm font-medium text-[#3C3333] mb-3">Health issues?</label>
							<div className="flex flex-wrap items-center gap-4 text-sm text-[#3C3333]">
								<label className="inline-flex items-center gap-2">
									<input 
										type="radio" 
										name="health" 
										className="accent-[#8D52A7]" 
										checked={!hasHealthIssues}
										onChange={() => setHasHealthIssues(false)}
									/> No
								</label>
								<label className="inline-flex items-center gap-2">
									<input 
										type="radio" 
										name="health" 
										className="accent-[#8D52A7]"
										checked={hasHealthIssues}
										onChange={() => setHasHealthIssues(true)}
									/> Yes
								</label>
								{hasHealthIssues && (
									<input
										type="text"
										value={healthDetails}
										onChange={(e) => setHealthDetails(e.target.value)}
										placeholder="Describe the health issues..."
										className="flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#3C3333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
									/>
								)}
							</div>
							
							<div className="mt-4">
								<label className="block text-sm font-medium text-[#3C3333] mb-2">Has collar or ID?</label>
								<div className="flex flex-wrap items-center gap-4 text-sm">
									<label className="inline-flex items-center gap-2">
										<input 
											type="radio" 
											name="collar" 
											className="accent-[#8D52A7]"
											checked={!hasCollar}
											onChange={() => setHasCollar(false)}
										/> No
									</label>
									<label className="inline-flex items-center gap-2">
										<input 
											type="radio" 
											name="collar" 
											className="accent-[#8D52A7]"
											checked={hasCollar}
											onChange={() => setHasCollar(true)}
										/> Yes
									</label>
									{hasCollar && (
										<input
											type="text"
											value={collarDetails}
											onChange={(e) => setCollarDetails(e.target.value)}
											placeholder="Describe the collar or ID..."
											className="flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#3C3333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
										/>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Submit button - Centered */}
					<div className="mt-6 flex justify-center">
						<div className="space-y-2">
							<button
								onClick={handleSubmit}
								disabled={submitting}
								className="px-8 py-2.5 rounded-lg bg-[#8D52A7] text-white font-semibold disabled:opacity-50 hover:bg-[#7B4692]"
							>
								{submitting ? "Submitting..." : "Submit Report"}
							</button>
							{resultMsg && <p className="text-xs text-gray-700 text-center">{resultMsg}</p>}
						</div>
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

