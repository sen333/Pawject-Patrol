"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
};

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
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-gray-900">Animal Profile (Admin)</h1>
					<Link href="/admin/profiles" className="text-sm text-purple-700 hover:underline">← Back to Profiles</Link>
				</div>

				{loading && (
					<div className="py-24 text-center text-gray-500">Loading...</div>
				)}
				{error && (
					<div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
						Error: {error}
					</div>
				)}
				{!loading && !error && !animal && (
					<div className="py-24 text-center text-gray-500">Animal not found.</div>
				)}

				{animal && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-100">
							{animal.animal_photo ? (
								<img
									src={animal.animal_photo}
									alt={animal.animal_name || "Animal"}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.currentTarget as HTMLImageElement).style.display = "none";
									}}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
									No photo
								</div>
							)}
							<div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(animal.animal_status)}`}>
								{animal.animal_status || "Unknown"}
							</div>
						</div>
						<div className="p-6 md:p-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">{animal.animal_name || "Unnamed"}</h2>
							<p className="text-sm text-gray-600 mb-4">
								{[animal.animal_breed, animal.animal_species].filter(Boolean).join(" • ") || "Unknown"}
							</p>
							{animal.animal_description && (
								<p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
									{animal.animal_description}
								</p>
							)}
							<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
								<div>
									<dt className="font-medium text-gray-600">Status</dt>
									<dd className="text-gray-800">{animal.animal_status || "Unknown"}</dd>
								</div>
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
									<dt className="font-medium text-gray-600">Location</dt>
									<dd className="text-gray-800">{animal.animal_location || "Unknown"}</dd>
								</div>
								<div>
									<dt className="font-medium text-gray-600">Vaccination Status</dt>
									<dd className="text-gray-800">{animal.vaccination_status || "Unknown"}</dd>
								</div>
								<div>
									<dt className="font-medium text-gray-600">Created</dt>
									<dd className="text-gray-800">{animal.created_at ? new Date(animal.created_at).toLocaleString() : "—"}</dd>
								</div>
							</dl>
							<div className="mt-8 flex gap-3">
								<Link
									href="/admin/profiles"
									className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
								>
									Back
								</Link>
								<Link
									href={`/admin/profiles/animal/${animal.animal_id}/edit`}
									className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
								>
									Edit Animal
								</Link>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
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
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
							<h3 className="text-lg font-bold text-gray-900 mb-2">Delete Animal Profile</h3>
							<p className="text-sm text-gray-600 mb-6">
								Are you sure you want to delete <strong>{animal?.animal_name}</strong>? This action cannot be undone.
							</p>
							<div className="flex gap-3 justify-end">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									disabled={deleting}
									className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									disabled={deleting}
									className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
								>
									{deleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
