"use client";

import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

import React, { useState, useEffect, memo } from "react";
import { supabase } from '@/utils/supabase/client'
import { useRouter } from "next/navigation";
import type { ReportTheme } from "@/actions/form/user";
import Image from "next/image";
import Link from "next/link";
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";

type SidebarProps = {
	userName: string | null;
	userEmail: string | null;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	router: any;
};

function Sidebar({ userName, userEmail, sidebarOpen, setSidebarOpen, router }: SidebarProps) {
	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-black/50 z-30 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
				onClick={() => setSidebarOpen(false)}
			/>
			{/* Sidebar */}
			<div
				className={`fixed left-0 top-0 h-screen w-[375px] bg-[#E1E69D] z-40 transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}
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
					<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
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
									<div className="w-10 h-10 rounded-full bg-[#8D52A7] flex items-center justify-center">
										<span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
									</div>
									<div className="flex flex-col">
										<span className="font-semibold text-gray-800 text-sm" style={{ color: "#3C3333", fontFamily: "Genty Sans", fontSize: "16px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>{userName}</span>
										<span className="text-xs text-gray-600" style={{ color: "#3C3333", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal" }}>{userEmail}</span>
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
								{ label: "Home", icon: (
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								)},
								{ label: "About Us", icon: (
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								)},
								{ label: "Mission", icon: (
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<g clipPath="url(#clip0)">
											<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
											<path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
											<path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
										</g>
									</svg>
								)},
								{ label: "Vision", icon: (
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
										<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
									</svg>
								)},
								{ label: "Goals", icon: (
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986" stroke="#689668" strokeWidth="2"/>
										<path d="M22 4L12 14.01L9 11.01" stroke="#689668" strokeWidth="2"/>
									</svg>
								)}
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
				{/* Bottom Section – Social Links */}
				<div className="flex items-center gap-3 mt-auto">
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
}

// Field component
interface FieldProps {
	label: string;
	placeholder: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field = memo(function Field({ label, placeholder, type = "text", value, onChange }: FieldProps) {
	return (
		<div className="rounded-xl bg-[#E1E69D] p-4">
			<label className="block mb-2" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500, lineHeight: "14px" }}>
				{label}
			</label>
			<input
				type={type}
				placeholder={placeholder}
				value={typeof value === 'string' ? value : (value ?? "")}
				onChange={onChange}
				className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] placeholder:rgba(60,51,51,0.6) focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
				style={{ backgroundColor: "#C2C876" }}
			/>
		</div>
	);
});

// SelectField component
interface SelectFieldProps {
	label: string;
	options: string[];
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField = memo(function SelectField({ label, options, value, onChange }: SelectFieldProps) {
	return (
		<div className="rounded-xl bg-[#E1E69D] p-4">
			<label className="block mb-2" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500, lineHeight: "14px" }}>
				{label}
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full rounded-lg px-3 py-2 text-sm text-[#3C3333] focus:outline-none focus:ring-2 focus:ring-[#8D52A7]"
				style={{ backgroundColor: "#C2C876" }}
			>
				{options.map((o: string) => (
					<option key={o} value={o}>{o}</option>
				))}
			</select>
		</div>
	);
});

// TextArea component
interface TextAreaProps {
	label: string;
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = memo(function TextArea({ label, placeholder, value, onChange }: TextAreaProps) {
	return (
		<div className="rounded-xl bg-[#E1E69D] p-4">
			<label className="block mb-2" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500, lineHeight: "14px" }}>
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
});

// ...existing code...
export default function ReportFormSample() {
	// Sidebar nav items array (fixes JSX parse errors)
	const sidebarNavItems = [
		{ label: "Home", icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		)},
		{ label: "About Us", icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		)},
		{ label: "Mission", icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<g clipPath="url(#clip0)">
					<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
					<path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
					<path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
				</g>
			</svg>
		)},
		{ label: "Vision", icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
				<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
			</svg>
		)},
		{ label: "Goals", icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986" stroke="#689668" strokeWidth="2"/>
				<path d="M22 4L12 14.01L9 11.01" stroke="#689668" strokeWidth="2"/>
			</svg>
		)}
	];
	const router = useRouter();
	const [preview, setPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [lat, setLat] = useState<number | null>(7.0858);
	const [lng, setLng] = useState<number | null>(125.4853);
	const [submitting, setSubmitting] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	const [recorderName, setRecorderName] = useState("");
	const [userName, setUserName] = useState<string | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
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
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Supabase auth: populate user info and subscribe to auth changes
	useEffect(() => {
		const checkAuth = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			setIsAuthenticated(!!user);
			if (user) {
				setUserEmail(user.email || null);
				const nameFromMeta = (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || "";
				setUserName(nameFromMeta || user.email?.split("@")[0] || null);
			} else {
				setUserName(null);
				setUserEmail(null);
			}
		};

		checkAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsAuthenticated(!!session?.user);
			if (session?.user) {
				setUserEmail(session.user.email || null);
				const nameFromMeta = (session.user.user_metadata as any)?.full_name || (session.user.user_metadata as any)?.name || "";
				setUserName(nameFromMeta || session.user.email?.split("@")[0] || null);
			} else {
				setUserName(null);
				setUserEmail(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

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
				// Keep sessionStorage so user can return to edit; it will be cleared after final submit
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
	
			// Persist form to sessionStorage so users don't lose progress
			try {
				let photoBase64: string | null = null;
				if (photoFile) {
					// Convert File -> DataURL so it can be serialized and fetched later
					photoBase64 = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => {
							resolve(reader.result as string);
						};
						reader.onerror = () => reject(new Error('Failed to read file'));
						reader.readAsDataURL(photoFile);
					});
				}
				sessionStorage.setItem(
					'animalReportFormData',
					JSON.stringify({
						...formData,
						photoBase64,
						photoName: photoFile?.name || null,
						photoType: photoFile?.type || null
					})
				);
			} catch (err) {
				console.error('Failed to save form data:', err);
			}
	
			// Build query params for confirm page so we can show a quick review
			const params = new URLSearchParams({
				recorderName: recorderName || "",
				animalName: animalName || "",
				animalType: animalType || "",
				gender: gender || "",
				dateSeen: dateSeen || "",
				physicalDescription: physicalDescription || "",
				otherInfo: otherInfo || "",
				area: area || "",
				landmark: landmark || "",
				road: road || "",
				theme: theme || 'blue',
				hasHealthIssues: hasHealthIssues ? '1' : '0',
				healthDetails: healthDetails || "",
				hasCollar: hasCollar ? '1' : '0',
				collarDetails: collarDetails || "",
				lat: lat != null ? String(lat) : "",
				lng: lng != null ? String(lng) : "",
				photoUrl: preview || ""
			});

			// Navigate to confirm page with compact params; full snapshot available in sessionStorage
			router.push(`/form/confirm?${params.toString()}`);
			return;
		}
	
			   return (
				   <main className="min-h-screen bg-[#E6E6E6] ">
							   <Sidebar
									userName={userName}
									userEmail={userEmail}
									sidebarOpen={sidebarOpen}
									setSidebarOpen={setSidebarOpen}
									router={router}
								/>
				   <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
					   <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
						   <button 
							   className="p-2 hover:bg-gray-100 rounded-lg transition"
							   onClick={() => setSidebarOpen(true)}
						   >
							   <Menu className="w-6 h-6 text-gray-800" />
						   </button>
						   <div className="flex-1 flex justify-center items-center h-full">
							   <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} className="flex-shrink-0" />
						   </div>
						   <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
							   <LogIn className="w-6 h-6 text-gray-800" />
						   </Link>
					   </div>
				   </header>
	
				   <section className="max-w-6xl mx-auto px-4 py-6">
					   <div className="rounded-xl bg-[#E1E69D] border-[#3C3333] backdrop-blur-sm p-5 flex flex-wrap justify-center items-start content-start gap-[15px] md:gap-[15px] lg:gap-[20px] border-1 border-[#3C3333] self-stretch">
						   {/* Picture panel */}
						   <div className="w-full flex flex-wrap gap-[15px] lg:gap-[20px]">
							   <div className="w-full lg:w-[340px] rounded-xl bg-[#E6E6E6] p-4 flex flex-col">
								   <div
									   className="w-full h-[300px] rounded-lg bg-[#E6E6E6] flex items-center justify-center overflow-hidden cursor-pointer"
									   onClick={() => document.getElementById('photo-input')?.click()}
								   >
									   {preview ? (
										   <img src={preview} alt="Animal photo" className="w-full h-full object-cover" />
									   ) : (
										   <div className="flex flex-col items-center text-gray-600 text-sm gap-2">
											   <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
												   <path d="M29 8H19L14 14H8C6.93913 14 5.92172 14.4214 5.17157 15.1716C4.42143 15.9217 4 16.9391 4 18V36C4 37.0609 4.42143 38.0783 5.17157 38.8284C5.92172 39.5786 6.93913 40 8 40H40C41.0609 40 42.0783 39.5786 42.8284 38.8284C43.5786 38.0783 44 37.0609 44 36V18C44 16.9391 43.5786 15.9217 42.8284 15.1716C42.0783 14.4214 41.0609 14 40 14H34L29 8Z" stroke="#3C3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
												   <path d="M24 32C27.3137 32 30 29.3137 30 26C30 22.6863 27.3137 20 24 20C20.6863 20 18 22.6863 18 26C18 29.3137 20.6863 32 24 32Z" stroke="#3C3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
											   </svg>
											   <span style={{ color: "#000", fontFamily: '"Genty Sans", sans-serif', fontSize: "16px", fontWeight: 400 }}>Picture</span>
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
								   <p className="mt-3 text-xs text-[#000]">Tap to upload (optional)</p>
							   </div>
							   {/* Fields panel */}
							   <div className="flex-1 min-w-[327px] space-y-3">
								   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									   <Field label="Recorder Name" placeholder="Your name" value={recorderName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecorderName(e.target.value)} />
									   <Field label="Animal Name (Optional)" placeholder="Animal's name" value={animalName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnimalName(e.target.value)} />
								   </div>
								   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									   <Field label="Type of animal" placeholder="Dog, Cat, etc." value={animalType} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnimalType(e.target.value)} />
									   <div className="grid grid-cols-2 gap-3">
										   <SelectField label="Gender" options={["Unknown", "Male", "Female"]} value={gender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)} />
										   <Field label="Date Seen" type="date" placeholder="Date seen" value={dateSeen} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateSeen(e.target.value)} />
									   </div>
								   </div>
								   <TextArea label="Physical Description" placeholder="Color, size, markings, etc." value={physicalDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPhysicalDescription(e.target.value)} />
							   </div>
						   </div>
	
						   {/* Location */}
						   <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
							   <Field label="Area Seen (Location)" placeholder="General area" value={area} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArea(e.target.value)} />
							   <Field label="Landmark Near Location" placeholder="Known landmark" value={landmark} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLandmark(e.target.value)} />
							   <Field label="What Road?" placeholder="Street / road name" value={road} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoad(e.target.value)} />
						   </div>
	
						   {/* Map */}
						   <div className="w-full rounded-xl bg-[#E1E69D] p-4">
							   <div className="rounded-lg h-72 md:h-80 bg-[#E1E69D] overflow-hidden relative">
								   <div className="absolute inset-0 z-10">
									   <MapView latitude={lat!} longitude={lng!} onLocationSelect={handleMapClick} />
								   </div>
								   <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-50">
									   <button
										   type="button"
										   onClick={grabCurrentLocation}
										   className="px-3 py-1.5 rounded-md bg-[#8D52A7] text-white text-xs hover:bg-[#7B4692] shadow"
									   >
										   Use My Location
									   </button>
									   <button
										   type="button"
										   onClick={() => { setLat(7.0858); setLng(125.4853); setResultMsg(null); }}
										   className="px-3 py-1.5 rounded-md bg-[#8D52A7] text-white text-xs hover:bg-[#7B4692] shadow"
									   >
										   Reset to UP Oblation
									   </button>
								   </div>
							   </div>
						   </div>
	
						   {/* Health & Collar */}
						   <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[10px] md:gap-[15px] lg:gap-[20px]">
							   {/* Health Issues */}
							   <div className="rounded-xl bg-[#E1E69D] p-4">
								   <label className="block mb-2" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500, lineHeight: "14px" }}>
									   Health Issues?
								   </label>
								   <div className="flex flex-wrap items-center gap-4 text-sm">
									   <label className="inline-flex items-center gap-1">
										   <input type="radio" name="health" className="accent-[#8D52A7] outline-none" checked={!hasHealthIssues} onChange={() => setHasHealthIssues(false)} />
										   No
									   </label>
									   <label className="inline-flex items-center gap-1">
										   <input type="radio" name="health" className="accent-[#8D52A7] outline-none" checked={hasHealthIssues} onChange={() => setHasHealthIssues(true)} />
										   Yes
									   </label>
									   {hasHealthIssues && (
										   <input
											   className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
											   style={{ backgroundColor: "#C2C876"}}
											   placeholder="Describe"
											   value={healthDetails}
											   onChange={(e) => setHealthDetails(e.target.value)}
										   />
									   )}
								   </div>
							   </div>
	
							   {/* Collar */}
							   <div className="rounded-xl bg-[#E1E69D] p-4">
								   <label className="block mb-2" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif', fontSize: "14px", fontWeight: 500, lineHeight: "14px" }}>
									   Has Collar?
								   </label>
								   <div className="flex flex-wrap items-center gap-4 text-sm">
									   <label className="inline-flex items-center gap-1">
										   <input type="radio" name="collar" className="accent-[#8D52A7] outline-none" checked={!hasCollar} onChange={() => setHasCollar(false)} />
										   No
									   </label>
									   <label className="inline-flex items-center gap-1">
										   <input type="radio" name="collar" className="accent-[#8D52A7] outline-none" checked={hasCollar} onChange={() => setHasCollar(true)} />
										   Yes
									   </label>
									   {hasCollar && (
										   <input
											   className="flex-1 min-w-[140px] rounded-lg px-2 py-1 text-sm text-[#3C3333] outline-none focus:ring-2 focus:ring-[#8D52A7]"
											   style={{ backgroundColor: "#C2C876"}}
											   placeholder="Describe"
											   value={collarDetails}
											   onChange={(e) => setCollarDetails(e.target.value)}
										   />
									   )}
								   </div>
							   </div>
						   </div>
	
						   <div className="w-full">
							   <TextArea label="Any Other Information" placeholder="Any additional details..." value={otherInfo} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOtherInfo(e.target.value)} />
						   </div>
	
						   {/* Theme */}
						   <div className="w-full rounded-xl bg-[#E1E69D] p-4">
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
						   <div className="w-full">
							   <button onClick={handleConfirm} type="button" className="w-full rounded-md bg-[#8D52A7] py-3 text-sm font-semibold text-white hover:bg-[#7B4692]">
								   Confirm Report
							   </button>
							   {resultMsg && <p className="mt-2 text-xs text-gray-800 text-center">{resultMsg}</p>}
						   </div>
					   </div>
				   </section>
			   </main>
		   );


}