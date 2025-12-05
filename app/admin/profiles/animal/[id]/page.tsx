"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Menu, LogIn } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { deleteAnimalProfile } from "@/actions/profiles/admin";

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

// Helper: convert animal_theme name to hex color
function getThemeColor(theme: string | null | undefined): string {
	if (!theme) return "#689668"; // default green
	const themeMap: Record<string, string> = {
		blue: "#5E9BBA",
		green: "#689668",
		orange: "#DCB57E",
		pink: "#C575AD",
	};
	return themeMap[theme.toLowerCase()] || "#689668";
}

// Function to get CSS classes for status badge
function statusBadgeClasses(status?: string | null) {
	const s = (status || "").toLowerCase();
	if (s.includes("available")) return "bg-green-100 text-green-800 border-green-200";
	if (s.includes("adopted")) return "bg-gray-100 text-gray-800 border-gray-200";
	if (s.includes("pending")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
	if (s.includes("shelter") || s.includes("rescue")) return "bg-blue-100 text-blue-800 border-blue-200";
	if (s.includes("treat") || s.includes("care")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
	if (s.includes("lost") || s.includes("missing")) return "bg-red-100 text-red-800 border-red-200";
	return "bg-gray-100 text-gray-800 border-gray-200";
}

// Admin Animal Detail Page Component
export default function AdminAnimalDetailPage() {
	// Get route params and router
	const params = useParams();
	const router = useRouter();

	// Extract animal ID from params
	const id = params?.id as string | undefined;

	// State variables
	const [animal, setAnimal] = useState<Animal | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);

	// Fetch animal data on component mount or ID change
	useEffect(() => {
		// Check for valid ID
		if (!id) return;

		// Let active flag to prevent state updates on unmounted component
		let active = true;

		// Fetch one animal by ID
		const fetchOne = async () => {
			// Set loading and error states
			setLoading(true);
			setError(null);

			// Query the animal by ID
			const { data, error } = await supabase
				.from("animal")
				.select("*")
				.eq("animal_id", id)
				.maybeSingle();

			// Handle response
			if (!active) return;

			// Handle errors or set animal data
			if (error) {
				setError(error.message);
				setAnimal(null);
			} else {
				setAnimal(data as Animal);
			}

			// Finalize loading state
			setLoading(false);
		};
		// Fetch the animal data
		fetchOne();

		// Cleanup function to set active to false on unmount
		return () => {
			active = false;
		};
	}, [id]);

	// Handle animal deletion
	const handleDelete = async () => {
		// Check for valid ID
		if (!id) return;

		// Start deletion process
		setDeleting(true);

		// Attempt to delete the animal profile
		try {
			// Call the deleteAnimalProfile action
			const res = await deleteAnimalProfile(id);

			// Handle response
			if (res.success) {
				router.push("/admin/profiles");
			} 
			
			// Handle failure
			else {
				setError(res.error || "Failed to delete animal");
				setShowDeleteConfirm(false);
			}
		} catch (err: any) {
			// Handle unexpected errors during deletion
			setError(err?.message || "Unexpected error");
			setShowDeleteConfirm(false);
		} finally {
			// Finalize deleting state
			setDeleting(false);
		}
	};

	return (
		<main className="min-h-screen bg-[#E6E6E6]">
			<div className="max-w-7xl mx-auto px-4 py-0">
				{/* Navigation header */}
				<div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
					<div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
						<Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
							<Menu className="w-6 h-6 text-gray-800" />
						</Link>
						<div className="flex-1 flex justify-center items-center h-full">
							<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
						</div>
						<Link href="/admin/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
							<LogIn className="w-6 h-6 text-gray-800" />
						</Link>
					</div>
				</div>

				{/* Page header */}
				<header className="flex flex-col items-start justify-center py-6 mb-6">
					<h1
						className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1"
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
						Animal Profile Details
					</h1>
					<p
						className="text-xs sm:text-sm md:text-md"
						style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
					>
						View and manage animal information
					</p>
				</header>

				{loading && (
					<div className="py-24 text-center" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}>
						Loading...
					</div>
				)}
				{error && (
					<div className="py-4 mb-6 text-sm bg-red-50 border border-red-200 rounded-md px-4" style={{ color: "#DC2626", fontFamily: '"Genty Sans", sans-serif' }}>
						Error: {error}
					</div>
				)}
				{!loading && !error && !animal && (
					<div className="py-24 text-center" style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}>
						Animal not found.
					</div>
				)}

				{animal && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						{/* Image Section */}
						<div 
							className="relative h-80 bg-white cursor-pointer group"
							onClick={() => animal.animal_photo && setShowImageModal(true)}
							title="Click to View Animal Photo"
						>
							{animal.animal_photo ? (
								<>
									<img
										src={animal.animal_photo}
										alt={animal.animal_name || "Animal"}
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).style.display = "none";
										}}
									/>
									{/* Hover Overlay */}
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-lg bg-black bg-opacity-70 drop-shadow-lg">
											Click to View Animal Photo
										</span>
									</div>
								</>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
									No photo
								</div>
							)}
							{/* Name Overlay */}
							<div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
								<h2 className="text-3xl font-extrabold" style={{ fontFamily: '"Kawaii RT", sans-serif' }}>
									{animal.animal_name || "Unnamed"}
								</h2>
								<p className="text-sm font-medium" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
									{[animal.animal_breed, animal.animal_species].filter(Boolean).join(" • ") || "Unknown"}
								</p>
							</div>
						</div>

						{/* Content Section */}
						<div className="p-6 md:p-8" style={{ fontFamily: '"Genty Sans", sans-serif', backgroundColor: getThemeColor(animal.animal_theme) }}>
							{animal.animal_description && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-2" style={{ color: "#3C3333" }}>Description</h3>
									<p className="text-gray-700 leading-relaxed whitespace-pre-line">
										{animal.animal_description}
									</p>
								</div>
							)}

							{/* Animal Information Section */}
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4" style={{ color: "#3C3333" }}>Animal Information</h3>
								<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
									<div>
										<dt className="font-medium text-gray-600">Animal ID</dt>
										<dd className="text-gray-800">{animal.animal_id}</dd>
									</div>
									<div>
										<dt className="font-medium text-gray-600">Created</dt>
										<dd className="text-gray-800">{animal.created_at ? new Date(animal.created_at).toLocaleString() : "—"}</dd>
									</div>
									{animal.recorder_name && (
										<div>
											<dt className="font-medium text-gray-600">Recorder</dt>
											<dd className="text-gray-800">{animal.recorder_name}</dd>
										</div>
									)}
									<div>
										<dt className="font-medium text-gray-600">Species</dt>
										<dd className="text-gray-800">{animal.animal_species || "Unknown"}</dd>
									</div>
									<div>
										<dt className="font-medium text-gray-600">Breed</dt>
										<dd className="text-gray-800">{animal.animal_breed || "—"}</dd>
									</div>
									<div>
										<dt className="font-medium text-gray-600">Gender</dt>
										<dd className="text-gray-800">{animal.animal_gender || "Unknown"}</dd>
									</div>
									<div>
										<dt className="font-medium text-gray-600">Collar</dt>
										<dd className="text-gray-800">{animal.animal_collar || "—"}</dd>
									</div>
								</dl>
							</div>

							{/* Location Details Section */}
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4" style={{ color: "#3C3333" }}>Location Details</h3>
								<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
									{animal.area && (
										<div>
											<dt className="font-medium text-gray-600">Area</dt>
											<dd className="text-gray-800">{animal.area}</dd>
										</div>
									)}
									{animal.date_seen && (
										<div>
											<dt className="font-medium text-gray-600">Date Seen</dt>
											<dd className="text-gray-800">{new Date(animal.date_seen).toLocaleString()}</dd>
										</div>
									)}
									{animal.landmark && (
										<div>
											<dt className="font-medium text-gray-600">Landmark</dt>
											<dd className="text-gray-800">{animal.landmark}</dd>
										</div>
									)}
									{animal.road && (
										<div>
											<dt className="font-medium text-gray-600">Road</dt>
											<dd className="text-gray-800">{animal.road}</dd>
										</div>
									)}
								</dl>
							</div>

							{/* Health Details Section */}
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4" style={{ color: "#3C3333" }}>Health Details</h3>
								<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
									<div>
										<dt className="font-medium text-gray-600">Status</dt>
										<dd className="text-gray-800">{animal.animal_status || "Unknown"}</dd>
									</div>
									<div>
										<dt className="font-medium text-gray-600">Vaccination Status</dt>
										<dd className="text-gray-800">{animal.vaccination_status || "Unknown"}</dd>
									</div>
									{animal.health_issues && (
										<div>
											<dt className="font-medium text-gray-600">Health Issues</dt>
											<dd className="text-gray-800">{animal.health_issues}</dd>
										</div>
									)}
								</dl>
							</div>

							{animal.other_information && (
								<div className="mb-8">
									<h3 className="text-lg font-semibold mb-2" style={{ color: "#3C3333" }}>Other Information</h3>
									<p className="text-gray-700 leading-relaxed whitespace-pre-line">
										{animal.other_information}
									</p>
								</div>
							)}

							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									href="/admin/profiles"
									className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
									style={{ 
										backgroundColor: "#E6E6E6",
										color: "#3C3333",
										fontFamily: '"Genty Sans", sans-serif'
									}}
								>
									← Back to Profiles
								</Link>
								<Link
									href={`/admin/profiles/animal/${animal.animal_id}/edit`}
									className="px-6 py-2 rounded-lg text-white text-sm font-semibold transition-all"
									style={{
										backgroundColor: "#C2C876",
										fontFamily: '"Genty Sans", sans-serif'
									}}
								>
									Edit Animal
								</Link>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className="px-6 py-2 rounded-lg text-white text-sm font-semibold hover:bg-red-700 transition-all"
									style={{
										backgroundColor: "#DC2626",
										fontFamily: '"Genty Sans", sans-serif'
									}}
								>
									Delete Animal
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
							<h3 className="text-xl font-bold mb-2" style={{ color: "#3C3333", fontFamily: '"Kawaii RT", sans-serif' }}>
								Delete Animal Profile
							</h3>
							<p className="text-sm mb-6" style={{ color: "#3C3333" }}>
								Are you sure you want to delete <strong>{animal?.animal_name}</strong>? This action cannot be undone.
							</p>
							<div className="flex gap-3 justify-end">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									disabled={deleting}
									className="px-6 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
									style={{
										backgroundColor: "#E6E6E6",
										color: "#3C3333"
									}}
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									disabled={deleting}
									className="px-6 py-2 rounded-lg text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
									style={{
										backgroundColor: "#DC2626"
									}}
								>
									{deleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Image Modal */}
				{showImageModal && animal?.animal_photo && (
					<div 
						className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
						onClick={() => setShowImageModal(false)}
					>
						<div className="relative max-w-7xl max-h-full">
							<button
								onClick={() => setShowImageModal(false)}
								className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all z-10"
								aria-label="Close"
							>
								✕
							</button>
							<img
								src={animal.animal_photo}
								alt={animal.animal_name || "Animal"}
								className="max-w-full max-h-[90vh] object-contain"
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
