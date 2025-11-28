"use client";

// Imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Upload } from "lucide-react";
import { updateAnimalProfile } from "@/actions/profiles/admin";


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
	const [name, setName] = useState("");
	const [species, setSpecies] = useState("");
	const [breed, setBreed] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("In Shelter");
	const [gender, setGender] = useState("");
	const [location, setLocation] = useState("");
	const [vaccinationStatus, setVaccinationStatus] = useState("");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitMsg, setSubmitMsg] = useState<string | null>(null);

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
				setName(animalData.animal_name || "");
				setSpecies(animalData.animal_species || "");
				setBreed(animalData.animal_breed || "");
				setDescription(animalData.animal_description || "");
				setStatus(animalData.animal_status || "In Shelter");
				setGender(animalData.animal_gender || "");
				setLocation(animalData.animal_location || "");
				setVaccinationStatus(animalData.vaccination_status || "");
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
	
	// Handle photo file selection
	const handlePhotoChange = (file: File | null) => {
		// Update photo file and preview
		setPhotoFile(file);
		setPhotoPreview(file ? URL.createObjectURL(file) : animal?.animal_photo || null);
	};

	// Handle form submission
	const uploadPhoto = async (): Promise<string | undefined> => {
		// Upload photo to storage and return public URL
		if (!photoFile) return undefined;
		try {
			// Generate unique file path for the photo
			const ext = photoFile.name.split('.')?.pop() || 'jpg';
			const path = `${crypto.randomUUID()}.${ext}`;

			// Upload to Supabase Storage
			const { error } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
				cacheControl: '3600', upsert: false,
			});

			// Handle upload error
			if (error) {
				console.warn('Photo upload error', error.message);
				return undefined;
			}

			// Get public URL
			const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
			return urlData.publicUrl;
		} catch (e) {
			// Handle unexpected errors during photo upload
			console.warn('Photo upload exception', e);
			return undefined;
		}
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
			// Upload photo and update profile
			const photoUrl = await uploadPhoto();
			const res = await updateAnimalProfile({
				id,
				name,
				species,
				breed,
				description,
				status,
				location,
				vaccinationStatus,
				photoUrl,
				gender,
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
				}, 1000);
			}
		} catch (err: any) {
			// Handle unexpected errors during submission
			setSubmitMsg(err?.message || 'Unexpected error');
		} finally {
			// Finalize submitting state
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-gray-900">Edit Animal Profile</h1>
					<Link href={`/admin/profiles/animal/${id}`} className="text-sm text-purple-700 hover:underline">
						← Back to Profile
					</Link>
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
					<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
						<div className="grid gap-6 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Name *</label>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Buddy"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Species *</label>
								<input
									value={species}
									onChange={(e) => setSpecies(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Dog"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Breed</label>
								<input
									value={breed}
									onChange={(e) => setBreed(e.target.value)}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Labrador"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Status *</label>
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option>In Shelter</option>
									<option>Available for Adoption</option>
									<option>Under Treatment</option>
									<option>Lost / Missing</option>
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Gender *</label>
								<select
									value={gender}
									onChange={(e) => setGender(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option value="">Select Gender</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Unknown">Unknown</option>
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Location *</label>
								<input
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. UP Mindanao"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Vaccination Status *</label>
								<select
									value={vaccinationStatus}
									onChange={(e) => setVaccinationStatus(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-2 py-1 text-sm"
								>
									<option value="">Select Status</option>
									<option value="Fully Vaccinated">Fully Vaccinated</option>
									<option value="Partially Vaccinated">Partially Vaccinated</option>
									<option value="Not Vaccinated">Not Vaccinated</option>
									<option value="Vaccination In Progress">Vaccination In Progress</option>
									<option value="Overdue for Vaccination">Overdue for Vaccination</option>
									<option value="Unknown">Unknown</option>
								</select>
							</div>
							<div className="md:col-span-2 flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Description</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="Physical and behavioral notes"
								/>
							</div>
							<div className="md:col-span-2 flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Photo</label>
								<div className="flex items-start gap-4">
									<div
										className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-colors"
										onClick={() => document.getElementById('edit-photo-input')?.click()}
									>
										{photoPreview ? (
											<img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
										) : (
											<div className="flex flex-col items-center text-gray-400 text-xs gap-1">
												<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
													<circle cx="12" cy="13" r="4" />
												</svg>
												<span>Click to upload</span>
											</div>
										)}
									</div>
									<div className="flex-1">
										<input
											id="edit-photo-input"
											type="file"
											accept="image/*"
											onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
											className="text-xs"
										/>
										<p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
											<Upload className="w-3 h-3" /> Upload a new photo to replace the current one
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-8 flex items-center gap-3">
							<button
								type="submit"
								disabled={submitting}
								className="px-6 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? 'Saving...' : 'Save Changes'}
							</button>
							<Link
								href={`/admin/profiles/animal/${id}`}
								className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
							>
								Cancel
							</Link>
							{submitMsg && (
								<span className={`text-sm ${submitMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
									{submitMsg}
								</span>
							)}
						</div>
					</form>
				)}
			</div>
		</main>
	);
}
